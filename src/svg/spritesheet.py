#!/usr/bin/env python

import math
import re
import os.path
import argparse
import xml.etree.ElementTree
import json

parser = argparse.ArgumentParser(description=
  'Build a texture atlas from an annotated SVG file. '+
  'Add sprite areas by making a group containing a rectangle to define the area '+
  'and a text element to define the sprite name (with "=" prepended to it).')
parser.add_argument('svg', type=str,
                    help='the SVG file to take as input')
parser.add_argument('json', type=str, 
                    help='the file to write the texture atlas to')
args = parser.parse_args()

# manage a 2D affine transform
class Transform:
  # initialize to the identity matrix by default
  def __init__(self, a=1, b=0, c=0, d=1, e=0, f=0):
    (self.a, self.b, self.c, self.d, self.e, self.f) = (a, b, c, d, e, f)
  # clone the given transform into a new one
  def clone(self):
    return(Transform(self.a, self.b, self.c, self.d, self.e, self.f))
  # concatenate a second transform onto this one
  def concat(self, t):
    (self.a, self.b, self.c, self.d, self.e, self.f) = (
      (self.a * t.a) + (self.c * t.b),
      (self.b * t.a) + (self.d * t.b),
      (self.a * t.c) + (self.c * t.d),
      (self.b * t.c) + (self.d * t.d),
      (self.a * t.e) + (self.c * t.f) + self.e,
      (self.b * t.e) + (self.d * t.f) + self.f
    )
  # rotate the matrix by the given angle in radians
  def rotate(self, angle):
    c = math.cos(angle)
    s = math.sin(angle)
    (self.a, self.b, self.c, self.d) = (
      (self.a *  c) + (self.c * s),
      (self.b *  c) + (self.d * s),
      (self.a * -s) + (self.c * c),
      (self.b * -s) + (self.d * c))
  # rotate the matrix by the given angle in radians 
  #  around the point with the given coordinates
  def rotateAround(self, angle, x, y):
    self.translate(x, y)
    self.rotate(angle)
    self.translate(-x, -y)
  # translate the matrix by the given distance
  def translate(self, tx, ty):
    self.e += (tx * self.a) + (ty * self.c)
    self.f += (tx * self.b) + (ty * self.d)
  # scale the matrix by the given factors
  def scale(self, sx, sy=None):
    # scale isotropically if only one factor is passed
    if (sy == None):
      sy = sx
    self.a *= sx
    self.b *= sx
    self.c *= sy
    self.d *= sy
  # skew the matrix along an axis
  def skewX(self, angle):
    self.concat(Transform(c=math.atan(angle)))
  def skewY(self, angle):
    self.concat(Transform(b=math.atan(angle)))
  # parse an SVG transform attribute and apply it to the transform
  # read a transform matrix from an SVG transform attribute
  def parse(self, s):
    # get a list of all the transformations
    matches = re.findall(
      '[,\s]*((matrix|translate|scale|rotate|skewX|skewY)\s*\(([^\)]+)\))', s)
    if ((not matches) or (not (len(matches) > 0))):
      return
    for (full, func, args) in matches:
      # divide the arguments and make them into numbers
      args = re.split('[,\s]+', args)
      args = map(float, args)
      # concatenate the transform
      if ((func == 'matrix') and (len(args) == 6)):
        self.concat(Transform(args[0], args[1], args[2], args[3], args[4], args[5]))
      elif ((func == 'translate') and (len(args) == 2)):
        self.translate(args[0], args[1])
      elif ((func == 'scale') and (len(args) >= 1) and (len(args) <= 2)):
        if (len(args) == 1):
          self.scale(args[0])
        elif (len(args) == 2):
          self.scale(args[0], args[1])
      elif ((func == 'rotate') and (len(args) == 1)):
        self.rotate(math.radians(args[0]))
      elif ((func == 'rotate') and (len(args) == 3)):
        self.rotateAround(math.radians(args[0]), args[1], args[2])
      elif ((func == 'skewX') and (len(args) == 1)):
        self.skewX(math.radians(args[0]))
      elif ((func == 'skewY') and (len(args) == 1)):
        self.skewY(math.radians(args[0]))
      else:
        print("WARNING: unhandled transform: '%s'" % (full))
  # apply the transform to (x, y) coordinates contained in a tuple
  #  and return the result as another coordinate tuple
  def apply(self, coords=(0,0)):
    return((
      (self.a * coords[0]) + (self.c * coords[1]) + self.e,
      (self.b * coords[0]) + (self.d * coords[1]) + self.f
    ))

# extract frame info from an SVG element and its children
def addFrames(el, frames, ctm=Transform(), frame=None, name=None):
  # apply a transform matrix if there is one
  if ('transform' in el.attrib):
    ctm = ctm.clone()
    ctm.parse(el.attrib['transform'])
  for child in el:
    # find frame rectangles
    if (child.tag.endswith('rect')):
      # map to document coordinates
      x = float(child.attrib['x'])
      y = float(child.attrib['y'])
      w = float(child.attrib['width'])
      h = float(child.attrib['height'])
      (x0, y0) = ctm.apply((x, y))
      (x1, y1) = ctm.apply((x + w, y + h))
      frame = { 'x': min(x0, x1), 'y': min(y0, y1), 
                'w': abs(x1 - x0), 'h': abs(y1 - y0) }
    # find text labels
    if ((child.text) and (child.text.startswith('='))):
      name = child.text[1:]
    # recursively scan children
    (frame, name) = addFrames(child, frames, ctm, frame, name)
  # if we got an area and the right kind of text, add an entry
  if (frame and name):
    frames[name] = frame
    frame = None
    name = None
  # pass partial matches up to the parent
  return(frame, name)

# load the SVG document
root = xml.etree.ElementTree.parse(args.svg).getroot()

# get a transform mapping InkScape user units to pixels
(_x, _y, uuWidth, uuHeight) = [float(x) for x in root.attrib['viewBox'].split(' ')]
pxWidth = float(root.attrib['width'])
pxHeight = float(root.attrib['height'])
scale = ((pxWidth / uuWidth) + (pxHeight / uuHeight)) / 2
ctm = Transform()
ctm.scale(scale, scale)

# extract frames from the SVG document
frames = { }
addFrames(root, frames, ctm)

# expand frames to the texture atlas format
atlas = { 
  'meta': { 'image': os.path.basename(args.svg)[:-3]+'png' }, 
  'frames': { }
}
for (name, frame) in frames.iteritems():
  # convert from user units to pixels
  x = int(round(frame['x']))
  y = int(round(frame['y']))
  w = int(round(frame['w']))
  h = int(round(frame['h']))
  atlas['frames'][name] = {
    'frame': { 'x': x, 'y': y, 'w': w, 'h': h },
    'rotated': False,
    'trimmed': False,
    'spriteSourceSize': { 'x': 0, 'y': 0, 'w': w, 'h': h },
    'sourceSize': { 'w': w, 'h': h },
    'pivot': { 'x': 0.5, 'y': 0.5 }
  }

# write the atlas
with open(args.json, 'wb') as f:
  json.dump(atlas, f, indent=2, sort_keys=True)
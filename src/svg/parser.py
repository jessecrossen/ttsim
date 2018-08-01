import re
import math
import xml.etree.ElementTree

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
      elif ((func == 'translate') and (len(args) == 1)):
        self.translate(args[0], 0)
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

class SVGParser(object):

  def __init__(self, path):
    self.root = xml.etree.ElementTree.parse(path).getroot()

  # INTERFACE *****************************************************************

  # get a coordinate transform matrix from Inkscape user units to pixels
  def getTransformToPixels(self):
    (_x, _y, uuWidth, uuHeight) = [ 
      float(x) for x in self.root.attrib['viewBox'].split(' ')]
    pxWidth = float(self.root.attrib['width'])
    pxHeight = float(self.root.attrib['height'])
    scale = ((pxWidth / uuWidth) + (pxHeight / uuHeight)) / 2
    ctm = Transform()
    ctm.scale(scale, scale)
    return(ctm)

  # get a list of (name, element, transform) tuples for groups containing text 
  #  with a given prefix
  def getGroupsLabeledWithPrefix(self, labelPrefix, ctm=Transform()):
    results = list()
    self._getLabeledGroupsIn(self.root, labelPrefix, results, ctm=ctm)
    return(results)
  
  # get a list of rectangles inside the given group, 
  #  with the given transform applied
  def getRectsInGroup(self, group, ctm=Transform()):
    rects = list()
    self._getRectsIn(group, ctm, rects)
    return(rects)

  # IMPLEMENTATION ************************************************************
  
  def _tagWithoutNamespace(self, el):
    return(el.tag.split('}')[-1])

  def _getLabeledGroupsIn(self, el, labelPrefix, results, ctm=Transform(), lastGroup=None):
    tag = self._tagWithoutNamespace(el)
    # save the next parent group up from the label
    if (tag == 'g'):
      lastGroup = el
    # apply a transform matrix if there is one
    if ('transform' in el.attrib):
      ctm = ctm.clone()
      ctm.parse(el.attrib['transform'])
    # find text labels
    if ((el.text is not None) and (lastGroup is not None) and 
        (el.text.startswith(labelPrefix))):
      results.append((el.text[1:], lastGroup, ctm))
    # search children of the group
    for child in el:
      # recursively scan children
      self._getLabeledGroupsIn(child, labelPrefix, results, ctm, lastGroup)
  
  # get rectangles inside the given group, transforming their 
  #  coordinates to document coordinates
  def _getRectsIn(self, el, ctm=Transform(), rects=list()):
    if (self._tagWithoutNamespace(el) == 'rect'):
      x = float(el.attrib['x'])
      y = float(el.attrib['y'])
      w = float(el.attrib['width'])
      h = float(el.attrib['height'])
      (x0, y0) = ctm.apply((x, y))
      (x1, y1) = ctm.apply((x + w, y + h))
      rects.append({ 'x': min(x0, x1), 'y': min(y0, y1), 
                     'w': abs(x1 - x0), 'h': abs(y1 - y0) })
    else:
      for child in el:
        self._getRectsIn(child, ctm, rects)
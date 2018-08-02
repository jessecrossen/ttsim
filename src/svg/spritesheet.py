#!/usr/bin/env python

import os.path
import argparse
import json

from parser import SVGParser

parser = argparse.ArgumentParser(description=
  'Build a texture atlas from an annotated SVG file. '+
  'Add sprite areas by making a group containing a rectangle to define the area '+
  'and a text element to define the sprite name (with "=" prepended to it).')
parser.add_argument('svg', type=str,
                    help='the SVG file to take as input')
parser.add_argument('json', type=str, 
                    help='the file to write the texture atlas to')
args = parser.parse_args()

p = SVGParser(args.svg)

toPixels = p.getTransformToPixels()
groups = p.getGroupsLabeledWithPrefix('=', ctm=toPixels)
frames = { }
for (name, group, ctm) in groups:
  rects = p.getRectsInGroup(group, ctm=ctm)
  if (len(rects) > 0):
    frames[name] = rects[0]

# expand frames to the texture atlas format
atlas = { 
  'meta': { 'image': os.path.basename(args.svg)[:-3]+'png' }, 
  'frames': { }
}
for (name, frame) in frames.iteritems():
  # snap to pixels
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
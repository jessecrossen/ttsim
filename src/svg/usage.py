#!/usr/bin/env python

import os.path
import argparse
import json

parser = argparse.ArgumentParser(description=
  'Compose ImageMagick arguments to extract sprites from a spritesheet.')
parser.add_argument('png', type=str,
                    help='the image of the spritesheet')
parser.add_argument('json', type=str,
                    help='the texture atlas indicating sprite position')
parser.add_argument('target', type=str, 
                    help='the directory to write images to')
args = parser.parse_args()

with open(args.json, 'r') as f:
  sprites = json.load(f)

for (name, data) in sprites['frames'].iteritems():
  if ((name.endswith('-t')) or (name[0] == name[0].lower()) or 
      (name == 'Ball-m')):
    tint = ''
    if (name.startswith('Ball')):
      tint = '-fill #0d64ff -colorize 50%'
    frame = data['frame']
    (x, y, w, h) = (frame['x'], frame['y'], frame['w'], frame['h'])
    print('%s -crop %dx%d+%d+%d %s %s/%s.png' % 
      (args.png, w, h, x, y, tint, args.target, name))
import re
import math
import xml.etree.ElementTree

# manage a 2D affine transform
class Transform(object):
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
      r'[,\s]*((matrix|translate|scale|rotate|skewX|skewY)\s*\(([^\)]+)\))', s)
    if ((not matches) or (not (len(matches) > 0))):
      return
    for (full, func, args) in matches:
      # divide the arguments and make them into numbers
      args = re.split(r'[,\s]+', args)
      args = [ float(p) for p in args ]
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
    
  # get a list of circles inside the given group, 
  #  with the given transform applied
  def getCirclesInGroup(self, group, ctm=Transform()):
    circles = list()
    self._getCirclesIn(group, ctm, circles)
    return(circles)
  
  # get a list of paths inside the given group as lists of (x, y) tuples, 
  #  with the given base transform applied
  def getPathsInGroup(self, group, ctm=Transform()):
    paths = list()
    self._getPathsIn(group, ctm, paths)
    return(paths)

  # IMPLEMENTATION ************************************************************
  
  def _tagWithoutNamespace(self, el):
    return(el.tag.split('}')[-1])
  
  def _applyTransform(self, el, ctm):
    if ('transform' in el.attrib):
      ctm = ctm.clone()
      ctm.parse(el.attrib['transform'])
    return(ctm)

  def _getLabeledGroupsIn(self, el, labelPrefix, results, ctm=Transform(), lastGroup=None):
    tag = self._tagWithoutNamespace(el)
    # save the next parent group up from the label and the transform above it
    if (tag == 'g'):
      lastGroup = (el, ctm)
    # apply a transform matrix if there is one
    ctm = self._applyTransform(el, ctm)
    # find text labels
    if ((el.text is not None) and (lastGroup is not None) and 
        (el.text.startswith(labelPrefix))):
      results.append((el.text[1:], lastGroup[0], lastGroup[1]))
    # search children of the group
    for child in el:
      # recursively scan children
      self._getLabeledGroupsIn(child, labelPrefix, results, ctm, lastGroup)
  
  # get rectangles inside the given group, transforming their 
  #  coordinates to document coordinates
  def _getRectsIn(self, el, ctm=Transform(), rects=list()):
    # apply a transform matrix if there is one
    ctm = self._applyTransform(el, ctm)
    # find rectangles
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
  
  # get circles inside the given group, transforming their 
  #  coordinates to document coordinates
  def _getCirclesIn(self, el, ctm=Transform(), circles=list()):
    # apply a transform matrix if there is one
    ctm = self._applyTransform(el, ctm)
    # find circles
    if (self._tagWithoutNamespace(el) in ('circle', 'ellipse')):
      x = float(el.attrib['cx'])
      y = float(el.attrib['cy'])
      if ('r' in el.attrib):
        r = float(el.attrib['r'])
      else:
        r = (float(el.attrib['rx']) + float(el.attrib['ry'])) / 2
      (x, y) = ctm.apply((x, y))
      (r, _y) = ctm.apply((r, 0))
      circles.append({ 'x': x, 'y': y, 'r': r })
    else:
      for child in el:
        self._getCirclesIn(child, ctm, circles)
  
  # get paths inside the given group, transforming their coordinates to 
  #  document coordinates
  def _getPathsIn(self, el, ctm=Transform(), paths=list()):
    # apply a transform matrix if there is one
    ctm = self._applyTransform(el, ctm)
    # find paths
    if (self._tagWithoutNamespace(el) == 'path'):
      # get paths from the geometry attribute
      newPaths = self._parsePath(el.attrib['d'])
      # apply the coordinate transform to the paths
      for newPath in newPaths:
        paths.append([ ctm.apply(p) for p in newPath ])
    else:
      for child in el:
        self._getPathsIn(child, ctm, paths)
  
  def _parsePath(self, d):
    paths = list()
    # tokenize the path elements
    tokens = re.findall(r'[,\s]*([-+0-9.eE]+|[MmZzLlHhVvCcSsQqTtAa])', d)
    # set an initial position
    sp = (0.0, 0.0)
    ip = (0.0, 0.0)
    # process the path
    tokenIndex = 0
    operator = 'z'
    # begin the first path segment
    subpath = list()
    while (tokenIndex < len(tokens)):
      token = tokens[tokenIndex]
      # determine whether the current token is an operator 
      #  and how many parameters it consumes
      isOperator = True
      if ((token == 'Z') or (token == 'z')):
        paramCount = 0
      elif ((token == 'H') or (token == 'h') or (token == 'V') or (token == 'v')):
        paramCount = 1
      elif ((token == 'M') or (token == 'm') or (token == 'L') or (token == 'l') or
            (token == 'T') or (token == 't')):
        paramCount = 2
      elif ((token == 'S') or (token == 's') or (token == 'Q') or (token == 'q')):
        paramCount = 4
      elif ((token == 'C') or (token == 'c')):
        paramCount = 6
      elif ((token == 'A') or (token == 'a')):
        paramCount = 7
      else:
        isOperator = False
      # if this is an operator, switch the current operator and advance
      if (isOperator):
        operator = token
        tokenIndex += 1
      # if we're using a move-to operator twice, 
      #  subsequent operations are implicit line-to's
      elif (operator == 'M'):
        operator = 'L'
      elif (operator == 'm'):
        operator = 'l'
      # load parameters
      if (paramCount > 0):
        params = tokens[tokenIndex:tokenIndex+paramCount]
        params = [ float(p) for p in params ]
        tokenIndex += paramCount
      # if there are no parameters and this is not an operator, move on
      elif (not isOperator):
        tokenIndex += 1
      # get a copy of the current position
      ep = sp
      # move-to
      if ((operator == 'M') or (operator == 'm')):
        # if there are any segments already in the path, draw them
        if (len(subpath) > 0):
          paths.append(subpath)
          subpath = list()
        # absolute move-to
        if (operator == 'M'):
          ip = sp = params
          subpath.append(sp)
        # relative move-to
        elif (operator == 'm'):
          ip = sp = (sp[0] + params[0], sp[1] + params[1])
          subpath.append(sp)
      # line-to
      elif ((operator == 'L') or (operator == 'l') or 
            (operator == 'H') or (operator == 'h') or
            (operator == 'V') or (operator == 'v')):
        # handle different types of line-to
        if (operator == 'H'): # absolute horizontal line-to
          ep = (params[0], ep[1])
        elif (operator == 'h'): # relative horizontal line-to
          ep = (sp[0] + params[0], ep[1])
        elif (operator == 'V'): # absolute vertical line-to
          ep = (ep[0], params[0])
        elif (operator == 'v'): # relative vertical line-to
          ep = (ep[0], sp[1] + params[0])
        elif (operator == 'L'): # absolute line-to
          ep = params
        elif (operator == 'l'): # relative line-to
          ep = (sp[0] + params[0], sp[1] + params[1])
        # add the line
        subpath.append(ep)
        # advance the cursor
        sp = ep
      # cubic curve-to (discard control points)
      elif ((operator == 'C') or (operator == 'c') or
            (operator == 'S') or (operator == 's')):
        # absolute cubic curve-to
        if (operator == 'C'):
          ep = params[4:6]
        # relative cubic curve-to
        elif (operator == 'c'):
          ep = (sp[0] + params[4], sp[1] + params[5])
        # absolute cubic smooth curve-to
        elif (operator == 'S'):
          ep = params[2:4]
        # relative cubic smooth curve-to
        elif (operator == 's'):
          ep = (sp[0] + params[2], sp[1] + params[3])
        # add the endpoint
        subpath.append(ep)
        # advance the cursor
        sp = ep
      # quadratic curve-to (discard control points)
      elif ((operator == 'Q') or (operator == 'q') or
            (operator == 'T') or (operator == 't')):
        # absolute quadratic curve-to
        if (operator == 'Q'):
          ep = params[2:4]
        # relative quadratic curve-to
        elif (operator == 'q'):
          ep = (sp[0] + params[2], sp[1] + params[3])
        # absolute quadratic smooth curve-to
        elif (operator == 'T'):
          ep = params
        # relative quadratic smooth curve-to
        elif (operator == 't'):
          ep = (sp[0] + params[0], sp[1] + params[1])
        # add the endpoint
        subpath.append(ep)
        # advance the cursor
        sp = ep
      # arc-to
      elif ((operator == 'A') or (operator == 'a')):
        # absolute arc-to
        if (operator == 'A'):
          ep = params[5:7]
        # relative arc-to
        elif (operator == 'a'):
          ep = (sp[0] + params[5], sp[1] + params[6])
        # add the endpoint
        subpath.append(ep)
        # advance the cursor
        sp = ep
      # close the path and reset the cursor
      elif ((operator == 'Z') or (operator == 'z')):
        sp = ip
        if (len(subpath) > 0):
          paths.append(subpath)
          subpath = list()
      else:
        print('WARNING: Unhandled path operator "%s"' % (operator))
    # write the end of the final subpath
    if (len(subpath) > 0):
      paths.append(subpath)
    # return accumulated paths
    return(paths)
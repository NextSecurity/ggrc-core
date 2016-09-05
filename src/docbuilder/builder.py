# Copyright (C) 2016 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

import os
import shutil

from mako.template import Template

from docbuilder import descriptors
from docbuilder import helpers


def build(title, path=None):
  if path is None:
    path = os.path.join(os.path.realpath('.'), '_docs')

  shutil.rmtree(path, ignore_errors=True)
  os.mkdir(path)

  render(
      'index.rst',
      'index',
      basedir=path,
      title=title,
      packages=descriptors.Package.all(),
  )

  for package in descriptors.Package.all():
    pkg_path = os.path.join(path, package.name)
    os.mkdir(pkg_path)
    for page in ('index', 'services', 'models', 'mixins'):
      render(
          '%s.rst' % page,
          'package/%s' % page,
          basedir=pkg_path,
          package=package,
      )


_template_path = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    'templates',
)
_templates = {}


def render(filename, template, basedir=None, **data):
  if template not in _templates:
    _templates[template] = Template(
        filename=os.path.join(_template_path, template + '.mako'),
    )
  template = _templates[template]

  if basedir is not None:
    filename = os.path.join(basedir, filename)
  with open(filename, 'w') as output:
    body = template.render_unicode(h=helpers, **data).encode('utf-8')
    output.write(body)

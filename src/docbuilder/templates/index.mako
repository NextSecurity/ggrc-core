## Copyright (C) 2016 Google Inc.
## Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

${h.title(title)}

..  toctree::
    :maxdepth: 3

    % for package in packages:
    ${package.name}/index
    % endfor

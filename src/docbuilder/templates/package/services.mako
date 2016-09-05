## Copyright (C) 2016 Google Inc.
## Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

Services
========


% for service in package.services:
${h.title('``%s``' % service.url, '-')}

Methods::

  % if service.readonly:
    GET ${service.url}
    GET ${service.url}/{id}
  % else:
    GET    ${service.url}
    POST   ${service.url}
    GET    ${service.url}/{id}
    PUT    ${service.url}/{id}
    DELETE ${service.url}/{id}
  % endif

Model :class:`${service.model.name}`


% endfor

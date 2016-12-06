/*!
    Copyright (C) 2016 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

(function (GGRC, _) {
  var allTypes = [
    'AccessGroup', 'Audit', 'Clause', 'Contract', 'Control', 'Assessment',
    'DataAsset', 'Facility', 'Issue', 'Market', 'Objective', 'OrgGroup',
    'Person', 'Policy', 'Process', 'Product', 'Program', 'Project',
    'Regulation', 'Section', 'Standard', 'System', 'Vendor'
  ];
  var baseWidgetsByType = {
    AccessGroup: _.difference(allTypes, ['AccessGroup']),
    Audit: _.difference(allTypes, ['Audit'])
      .concat('AssessmentTemplate').sort(),
    Clause: _.difference(allTypes, ['Clause']),
    Contract: _.difference(allTypes,
      ['Contract', 'Policy', 'Regulation', 'Standard']),
    Control: allTypes,
    Assessment: _.difference(allTypes, ['Assessment']),
    DataAsset: allTypes,
    Facility: allTypes,
    Issue: allTypes,
    Market: allTypes,
    Objective: allTypes,
    OrgGroup: allTypes,
    Person: _.difference(allTypes, ['Person']),
    Policy: _.difference(allTypes,
      ['Contract', 'Policy', 'Regulation', 'Standard']),
    Process: allTypes,
    Product: allTypes,
    Program: _.difference(allTypes, ['Program']),
    Project: allTypes,
    Regulation: _.difference(allTypes,
      ['Contract', 'Policy', 'Regulation', 'Standard']),
    Section: allTypes,
    Standard: _.difference(allTypes,
      ['Contract', 'Policy', 'Regulation', 'Standard']),
    System: allTypes,
    Vendor: allTypes
  };

  GGRC.tree_view = GGRC.tree_view || new can.Map();
  GGRC.tree_view.attr('base_widgets_by_type', baseWidgetsByType);
})(this.GGRC, this._);

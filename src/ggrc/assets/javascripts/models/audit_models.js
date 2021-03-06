/*!
 Copyright (C) 2016 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

(function (can, CMS) {
  function update_program_authorizations(programs, person) {
    return can.when(
      programs[0],
      programs[0].get_binding('program_authorized_people').refresh_instances(),
      programs[0].get_binding('program_authorizations').refresh_instances(),
      CMS.Models.Role.findAll({
        name: 'ProgramReader'
      }),
      CMS.Models.Role.findAll({
        name: 'ProgramEditor'
      })
    ).then(function (program, peopleBindings, authBindings,
                     reader_roles, editor_roles) {
      // ignore readers.  Give users an editor role
      var readerAuthorizations = [];
      var deleteDfds;
      var editorAuthorizedPeople = can.map(authBindings, function (ab) {
        if (~can.inArray(ab.instance.role.reify(), reader_roles)) {
          readerAuthorizations.push(ab.instance);
        } else {
          return ab.instance.person.reify();
        }
      });

      if (Permission.is_allowed('create', 'UserRole', program.context.id) &&
        !~can.inArray(person.reify(), editorAuthorizedPeople)) {
        deleteDfds = can.map(readerAuthorizations, function (ra) {
          if (ra.person.reify() === person.reify()) {
            return ra.refresh().then(function () {
              return ra.destroy();
            });
          }
        });
        return $.when.apply($, deleteDfds).then(function () {
          return new CMS.Models.UserRole({
            person: person,
            role: editor_roles[0].stub(),
            context: program.context
          }).save();
        });
      }
    }).then(Permission.refresh());
  }

  can.Model.Cacheable('CMS.Models.Audit', {
    root_object: 'audit',
    root_collection: 'audits',
    category: 'programs',
    findAll: 'GET /api/audits',
    findOne: 'GET /api/audits/{id}',
    update: 'PUT /api/audits/{id}',
    destroy: 'DELETE /api/audits/{id}',
    create: 'POST /api/audits',
    mixins: ['contactable', 'unique_title', 'ca_update', 'timeboxed'],
    is_custom_attributable: true,
    is_clonable: true,
    attributes: {
      context: 'CMS.Models.Context.stub',
      program: 'CMS.Models.Program.stub',
      requests: 'CMS.Models.Request.stubs',
      modified_by: 'CMS.Models.Person.stub',
      report_start_date: 'date',
      report_end_date: 'date',
      object_people: 'CMS.Models.ObjectPerson.stubs',
      people: 'CMS.Models.Person.stubs',
      audit_firm: 'CMS.Models.OrgGroup.stub',
      audit_objects: 'CMS.Models.AuditObject.stubs',
      custom_attribute_values: 'CMS.Models.CustomAttributeValue.stubs'
    },
    defaults: {
      status: 'Planned'
    },
    allowedMappings: [
      // Direct mapping to Audit
      {modelName: 'Assessment', mappingType: 'relation'},
      {modelName: 'AssessmentTemplate', mappingType: 'relation'},
      {modelName: 'Issue', mappingType: 'relation'},
      {modelName: 'Request', mappingType: 'relation'},
      // Mapping through Parent Object
      {modelName: 'AccessGroup', mappingType: 'snapshot'},
      {modelName: 'Clause', mappingType: 'snapshot'},
      {modelName: 'Contract', mappingType: 'snapshot'},
      {modelName: 'Control', mappingType: 'snapshot'},
      {modelName: 'DataAsset', mappingType: 'snapshot'},
      {modelName: 'Facility', mappingType: 'snapshot'},
      {modelName: 'Market', mappingType: 'snapshot'},
      {modelName: 'Objective', mappingType: 'snapshot'},
      {modelName: 'OrgGroup', mappingType: 'snapshot'},
      {modelName: 'Policy', mappingType: 'snapshot'},
      {modelName: 'Process', mappingType: 'snapshot'},
      {modelName: 'Product', mappingType: 'snapshot'},
      {modelName: 'Regulation', mappingType: 'snapshot'},
      {modelName: 'Section', mappingType: 'snapshot'},
      {modelName: 'Standard', mappingType: 'snapshot'},
      {modelName: 'System', mappingType: 'snapshot'},
      {modelName: 'Vendor', mappingType: 'snapshot'}
    ],
    getAllowedMappings: function () {
      return this.allowedMappings;
    },
    statuses: ['Planned', 'In Progress', 'Manager Review',
      'Ready for External Review', 'Completed'],
    obj_nav_options: {
      show_all_tabs: false,
      force_show_list: ['In Scope Controls', 'Requests',
        'Issues', 'Assessments']
    },
    tree_view_options: {
      header_view: GGRC.mustache_path + '/audits/tree_header.mustache',
      attr_list: [{
        attr_title: 'Title',
        attr_name: 'title'
      }, {
        attr_title: 'Audit Lead',
        attr_name: 'audit_lead',
        attr_sort_field: 'contact.name|email'
      }, {
        attr_title: 'Code',
        attr_name: 'slug'
      }, {
        attr_title: 'Status',
        attr_name: 'status'
      }, {
        attr_title: 'Last Updated',
        attr_name: 'updated_at'
      }, {
        attr_title: 'Start Date',
        attr_name: 'start_date'
      }, {
        attr_title: 'End Date',
        attr_name: 'end_date'
      }, {
        attr_title: 'Report Period',
        attr_name: 'report_period',
        attr_sort_field: 'report_end_date'
      }, {
        attr_title: 'Audit Firm',
        attr_name: 'audit_firm'
      }],
      draw_children: true,
      child_options: [{
        model: 'Request',
        mapping: 'requests',
        allow_creating: true,
        parent_find_param: 'audit.id'
      }, {
        model: 'Request',
        mapping: 'related_owned_requests',
        allow_creating: true,
        parent_find_param: 'audit.id'
      }]
    },
    init: function () {
      if (this._super) {
        this._super.apply(this, arguments);
      }
      this.validatePresenceOf('program');
      this.validateNonBlank('title');
      this.validateContact(['_transient.contact', 'contact'], {
        message: 'Internal audit lead cannot be empty'
      });
      this.validate(['_transient.audit_firm', 'audit_firm'],
        function () {
          var auditFirm = this.attr('audit_firm');
          var transientAuditFirm = this.attr('_transient.audit_firm');

          if (!auditFirm && transientAuditFirm) {
            if (_.isObject(transientAuditFirm) &&
              (auditFirm.reify().title !== transientAuditFirm.reify().title) ||
              (transientAuditFirm !== '' && transientAuditFirm !== null &&
              auditFirm !== null &&
              transientAuditFirm !== auditFirm.reify().title)) {
              return 'No valid org group selected for firm';
            }
          }
        }
      );
    }
  }, {
    object_model: can.compute(function () {
      return CMS.Models[this.attr('object_type')];
    }),
    clone: function (options) {
      var model = CMS.Models.Audit;
      return new model({
        operation: 'clone',
        cloneOptions: options.cloneOptions,
        program: this.program,
        title: this.title + new Date()
      });
    },
    save: function () {
      // Make sure the context is always set to the parent program
      var _super = this._super;
      var args = arguments;
      if (!this.context || !this.context.id) {
        return this.program.reify().refresh().then(function (program) {
          this.attr('context', program.context);
          return _super.apply(this, args);
        }.bind(this));
      }
      return _super.apply(this, args);
    },
    after_save: function () {
      var dfd;

      dfd = $.when(
        new RefreshQueue().enqueue(this.program.reify()).trigger(),
        this.contact
      ).then(update_program_authorizations);
      GGRC.delay_leaving_page_until(dfd);
    },
    findAuditors: function (returnList) {
      // If returnList is true, use findAuditors in the
      //  classical way, where the exact state of the list
      //  isn't needed immediately (as in a Mustache helper);
      //  if false, return a deferred that resolves to the list
      //  when the list is fully ready, for cases like permission
      //  checks for other modules.
      var loader = this.get_binding('authorizations');
      var auditorsList = new can.List();
      var dfds = [];

      if (returnList) {
        $.map(loader.list, function (binding) {
          // FIXME: This works for now, but is sad.
          var role;
          if (!binding.instance.selfLink) {
            return;
          }
          role = binding.instance.role.reify();

          function checkRole() {
            if (role.attr('name') === 'Auditor') {
              auditorsList.push({
                person: binding.instance.person.reify(),
                binding: binding.instance
              });
            }
          }

          if (role.selfLink) {
            checkRole();
          } else {
            role.refresh().then(checkRole);
          }
        });
        return auditorsList;
      }
      return loader.refresh_instances().then(function () {
        $.map(loader.list, function (binding) {
          // FIXME: This works for now, but is sad.
          dfds.push(new $.Deferred(function (dfd) {
            if (!binding.instance.selfLink) {
              binding.instance.refresh().then(function () {
                dfd.resolve(binding.instance);
              });
            } else {
              dfd.resolve(binding.instance);
            }
          }).then(function (instance) {
            var role = instance.role.reify();

            function checkRole() {
              if (role.attr('name') === 'Auditor') {
                auditorsList.push({
                  person: instance.person.reify(),
                  binding: instance
                });
              }
            }

            if (role.selfLink) {
              checkRole();
            } else {
              return role.refresh().then(checkRole);
            }
          }));
        });
        return $.when.apply($, dfds).then(function () {
          return auditorsList;
        });
      });
    }
  });

  /**
   * @Deprecated
   */
  can.Model.Cacheable('CMS.Models.Request', {
    root_object: 'request',
    root_collection: 'requests',
    findAll: 'GET /api/requests',
    findOne: 'GET /api/requests/{id}',
    create: 'POST /api/requests',
    update: 'PUT /api/requests/{id}',
    destroy: 'DELETE /api/requests/{id}',
    mixins: ['unique_title', 'relatable', 'ca_update', 'autoStatusChangeable',
      'timeboxed'],
    relatable_options: {
      relevantTypes: {
        Audit: {
          objectBinding: 'audits',
          relatableBinding: 'program_requests',
          weight: 5
        },
        Regulation: {
          objectBinding: 'related_regulations',
          relatableBinding: 'related_requests',
          weight: 3
        },
        Control: {
          objectBinding: 'related_controls',
          relatableBinding: 'related_requests',
          weight: 10
        }
      },
      threshold: 5
    },
    is_custom_attributable: false,
    attributes: {
      context: 'CMS.Models.Context.stub',
      assignee: 'CMS.Models.Person.stub',
      finished_date: 'date',
      verified_date: 'date',
      documents: 'CMS.Models.Document.stubs',
      audit: 'CMS.Models.Audit.stub',
      custom_attribute_values: 'CMS.Models.CustomAttributeValue.stubs'
    },
    defaults: {
      status: 'Not Started',
      start_date: moment().toDate(),
      end_date: GGRC.Utils.firstWorkingDay(moment().add(1, 'weeks'))
    },
    info_pane_options: {
      mapped_objects: {
        model: can.Model.Cacheable,
        mapping: 'info_related_objects',
        show_view: GGRC.mustache_path + '/base_templates/subtree.mustache'
      },
      evidence: {
        model: CMS.Models.Document,
        mapping: 'all_documents',
        show_view: GGRC.mustache_path + '/base_templates/attachment.mustache',
        sort_function: GGRC.Utils.sortingHelpers.commentSort
      },
      comments: {
        model: can.Model.Cacheable,
        mapping: 'comments',
        show_view: GGRC.mustache_path +
        '/base_templates/comment_subtree.mustache',
        sort_function: GGRC.Utils.sortingHelpers.commentSort
      },
      urls: {
        model: CMS.Models.Document,
        mapping: 'all_urls',
        show_view: GGRC.mustache_path + '/base_templates/urls.mustache'
      }
    },
    tree_view_options: {
      show_view: GGRC.mustache_path + '/requests/tree.mustache',
      header_view: GGRC.mustache_path + '/requests/tree_header.mustache',
      footer_view: GGRC.mustache_path + '/base_objects/tree_footer.mustache',
      add_item_view: GGRC.mustache_path + '/requests/tree_add_item.mustache',
      attr_list: [{
        attr_title: 'Title',
        attr_name: 'title'
      }, {
        attr_title: 'Status',
        attr_name: 'status'
      }, {
        attr_title: 'Verified',
        attr_name: 'verified',
        attr_sort_field: 'verified'
      }, {
        attr_title: 'Last Updated',
        attr_name: 'updated_at'
      }, {
        attr_title: 'Starts On',
        attr_name: 'start_date',
        attr_sort_field: 'start_date'
      }, {
        attr_title: 'Due On',
        attr_name: 'end_date',
        attr_sort_field: 'end_date'
      }, {
        attr_title: 'Verified Date',
        attr_name: 'verified_date',
        attr_sort_field: 'verified_date'
      }, {
        attr_title: 'Finished Date',
        attr_name: 'finished_date',
        attr_sort_field: 'finished_date'
      }, {
        attr_title: 'Request Type',
        attr_name: 'request_type'
      }, {
        attr_title: 'Code',
        attr_name: 'slug'
      }, {
        attr_title: 'Audit',
        attr_name: 'audit'
      }],
      display_attr_names: ['title', 'assignee', 'end_date',
        'status', 'request_type'],
      mandatory_attr_names: ['title'],
      draw_children: true,
      child_options: [{
        model: can.Model.Cacheable,
        mapping: 'info_related_objects',
        allow_creating: true
      }]
    },
    assignable_list: [{
      title: 'Requester(s)',
      type: 'requester',
      mapping: 'related_requesters',
      required: true
    }, {
      title: 'Assignee(s)',
      type: 'assignee',
      mapping: 'related_assignees',
      required: true
    }, {
      title: 'Verifier(s)',
      type: 'verifier',
      mapping: 'related_verifiers',
      required: false
    }],
    init: function () {
      this._super.apply(this, arguments);
      this.validateNonBlank('title');
      this.validateNonBlank('end_date');
      this.validateNonBlank('start_date');
      this.validatePresenceOf('audit');

      this.validate(['start_date', 'end_date'], function () {
        var datesAreValid;

        if (this.start_date && this.end_date) {
          datesAreValid = this.end_date >= this.start_date;
        }

        if (!datesAreValid) {
          return 'Start and/or Due date is invalid';
        }
      });

      this.validate(
        'validate_assignee',
        function () {
          if (!this.validate_assignee) {
            return 'You need to specify at least one assignee';
          }
        }
      );
      this.validate(
        'validate_requester',
        function () {
          if (!this.validate_requester) {
            return 'You need to specify at least one requester';
          }
        }
      );

      if (this === CMS.Models.Request) {
        this.bind('created', function (ev, instance) {
          if (instance.constructor === CMS.Models.Request) {
            instance.audit.reify().refresh();
          }
        });
      }
    }
  }, {
    init: function () {
      if (this._super) {
        this._super.apply(this, arguments);
      }
    },
    form_preload: function (new_object_form, object_params) {
      var audit;
      var auditId;
      var that = this;
      var assignees = {};
      var current_user = CMS.Models.get_instance('Person',
        GGRC.current_user.id);
      var contact;

      if (new_object_form) {
        // Current user should be Requester
        assignees[current_user.email] = 'Requester';

        // auditId = the audit info from the request creation button ||
        //           the audit from the current page if we are on audit page
        if (_.exists(object_params, 'audit.id')) {
          auditId = object_params.audit.id;
        } else if (_.exists(GGRC, 'page_model.type') === 'Audit') {
          auditId = GGRC.page_model.id;
        }

        if (auditId) {
          this.attr('audit', {
            id: auditId,
            type: 'Audit'
          });
        }

        if (this.audit) {
          audit = this.audit.reify();

          // Audit leads should be default assignees
          (audit.selfLink ? $.when(audit) : audit.refresh())
            .then(function (audit) {
              contact = audit.contact.reify();

              if (assignees[contact.email]) {
                assignees[contact.email] += ',Assignee';
              } else {
                assignees[contact.email] = 'Assignee';
              }
            });

          // Audit auditors should be default verifiers
          $.when(audit.findAuditors()).then(function (auditors) {
            auditors.each(function (elem) {
              elem.each(function (obj) {
                if (obj.type === 'Person') {
                  if (assignees[obj.email]) {
                    assignees[obj.email] += ',Verifier';
                  } else {
                    assignees[obj.email] = 'Verifier';
                  }
                }
              });
            });
          });
        }

        // Assign assignee roles
        can.each(assignees, function (value, key) {
          var person = CMS.Models.Person.findInCacheByEmail(key);
          that.mark_for_addition('related_objects_as_destination', person, {
            attrs: {
              AssigneeType: value
            }
          });
        });
      } // /new_object_form
    },
    save: function () {
      // Make sure the context is always set to the parent audit
      if (!this.context || !this.context.id) {
        this.attr('context', this.audit.reify().context);
      }
      return this._super.apply(this, arguments);
    },
    after_save: function () {
      // Create a relationship between request & assessment
      // if the request is created from the assessment view page
      var dfd;
      if (!(this.attr('assessment') && this.attr('assessment').stub)) {
        return;
      }
      dfd = new CMS.Models.Relationship({
        source: this.attr('assessment').stub(),
        destination: this.stub(),
        context: this.context.stub()
      }).save();
      GGRC.delay_leaving_page_until(dfd);
    },
    _refresh: function (bindings) {
      var refresh_queue = new RefreshQueue();
      can.each(bindings, function (binding) {
        refresh_queue.enqueue(binding.instance);
      });
      return refresh_queue.trigger();
    }
  });

  can.Model.Cacheable('CMS.Models.Meeting', {
    root_collection: 'meetings',
    root_object: 'meeting',
    findAll: 'GET /api/meetings',
    create: 'POST /api/meetings',
    update: 'PUT /api/meetings/{id}',
    destroy: 'DELETE /api/meetings/{id}',
    attributes: {
      context: 'CMS.Models.Context.stub',
      people: 'CMS.Models.Person.stubs',
      object_people: 'CMS.Models.ObjectPerson.stubs',
      start_at: 'datetime',
      end_at: 'datetime'
    },
    defaults: {},
    init: function () {
      if (this._super) {
        this._super.apply(this, arguments);
      }
      this.validateNonBlank('title');
      this.validateNonBlank('start_at');
      this.validateNonBlank('end_at');
    }
  }, {
    init: function () {
      if (this._super) {
        this._super.apply(this, arguments);
      }
      this.each(function (value, name) {
        if (value === null) {
          this.removeAttr(name);
        }
      }.bind(this));
      this.bind('change', function () {
        if (typeof this.response !== 'undefined' && !this._preloaded_people) {
          this._preloaded_people = true;
          _.map(this.response.reify().people, function (person) {
            this.mark_for_addition('people', person);
          }.bind(this));
        }
      }.bind(this));
    }
  });

  /**
   * A model describing a template for the newly created Assessment objects.
   *
   * This is useful when creating multiple similar Assessment objects. Using an
   * AssessmentTemplate helps avoiding repeatedly defining the same set of
   * Assessment object properties for each new instance.
   */
  can.Model.Cacheable('CMS.Models.AssessmentTemplate', {
    root_object: 'assessment_template',
    root_collection: 'assessment_templates',
    model_singular: 'AssessmentTemplate',
    model_plural: 'AssessmentTemplates',
    title_singular: 'Assessment Template',
    title_plural: 'Assessment Templates',
    table_singular: 'assessment_template',
    table_plural: 'assessment_templates',

    findOne: 'GET /api/assessment_templates/{id}',
    findAll: 'GET /api/assessment_templates',
    update: 'PUT /api/assessment_templates/{id}',
    destroy: 'DELETE /api/assessment_templates/{id}',
    create: 'POST /api/assessment_templates',

    is_custom_attributable: false,

    attributes: {
      audit: 'CMS.Models.Audit.stub',
      context: 'CMS.Models.Context.stub'
    },

    defaults: {
      test_plan_procedure: false,
      template_object_type: 'Control',
      default_people: {
        assessors: 'Object Owners',
        verifiers: 'Object Owners'
      },
      // the custom lists of assessor / verifier IDs if "other" is selected for
      // the corresponding default_people setting
      assessorsList: {},
      verifiersList: {},
      people_values: [
        {value: 'Object Owners', title: 'Object Owners'},
        {value: 'Audit Lead', title: 'Audit Lead'},
        {value: 'Auditors', title: 'Auditors'},
        {value: 'Primary Assessor', title: 'Principal Assignee'},
        {value: 'Secondary Assessors', title: 'Secondary Assignee'},
        {value: 'Primary Contact', title: 'Primary Contact'},
        {value: 'Secondary Contact', title: 'Secondary Contact'},
        {value: 'other', title: 'Others...'}
      ]
    },

    /**
     * Initialize the newly created object instance. Validate that its title is
     * non-blank and its default assessors / verifiers lists are set if
     * applicable.
     */
    init: function () {
      this._super.apply(this, arguments);
      this.validateNonBlank('title');

      this.validateListNonBlank(
        'assessorsList',
        function () {
          return this.attr('default_people.assessors') === 'other';
        }
      );
      this.validateListNonBlank(
        'verifiersList',
        function () {
          return this.attr('default_people.verifiers') === 'other';
        }
      );
    }
  }, {
    // the object types that are not relevant to the AssessmentTemplate,
    // i.e. it does not really make sense to assess them
    _NON_RELEVANT_OBJ_TYPES: Object.freeze({
      AssessmentTemplate: true,
      Assessment: true,
      Audit: true,
      CycleTaskGroupObjectTask: true,
      TaskGroup: true,
      TaskGroupTask: true,
      Workflow: true
    }),

    /**
     * An event handler when the add/edit form is about to be displayed.
     *
     * It builds a list of all object types used to populate the corresponding
     * dropdown menu on the form.
     * It also deserializes the default people settings so that those form
     * fields are correctly populated.
     *
     * @param {Boolean} isNewObject - true if creating a new instance, false if
     *   editing and existing one
     *
     */
    form_preload: function (isNewObject) {
      if (!this.custom_attribute_definitions) {
        this.attr('custom_attribute_definitions', new can.List());
      }
      if (!this.attr('_objectTypes')) {
        this.attr('_objectTypes', this._choosableObjectTypes());
      }
      this._unpackPeopleData();

      this._updateDropdownEnabled('assessors');
      this._updateDropdownEnabled('verifiers');
    },

    /**
     * Save the model instance by sending a POST/PUT request to the server
     *
     * @return {can.Deferred} - a deferred object resolved or rejected
     *   depending on the outcome of the undrelying API request
     */
    save: function () {
      this.attr('default_people', this._packPeopleData());

      return this._super.apply(this, arguments);
    },

    before_save: function () {
      this.attr('_objectTypes', undefined);
    },

    after_save: function () {
      if (this.audit) {
        this.audit.reify().refresh('related_assessment_templates');
      }
    },

    /**
     * Event handler when an assessor is picked in an autocomplete form field.
     * It adds the picked assessor's ID to the assessors list.
     *
     * @param {can.Map} context - the Mustache context of the `$el`
     * @param {jQuery.Element} $el - the source of the event `ev`
     * @param {jQuery.Event} ev - the event that was triggered
     */
    assessorAdded: function (context, $el, ev) {
      var user = ev.selectedItem;
      this.assessorsList.attr(user.id, true);
    },

    /**
     * Event handler when a user clicks to remove an assessor from the
     * assessors list. It removes the corresponding assessor ID from the list.
     *
     * @param {can.Map} context - the Mustache context of the `$el`
     * @param {jQuery.Element} $el - the source of the event `ev`
     * @param {jQuery.Event} ev - the event that was triggered
     */
    assessorRemoved: function (context, $el, ev) {
      var user = ev.person;
      this.assessorsList.removeAttr(String(user.id));
    },

    /**
     * Event handler when a verifier is picked in an autocomplete form field.
     * It adds the picked verifier's ID to the verifiers list.
     *
     * @param {can.Map} context - the Mustache context of the `$el`
     * @param {jQuery.Element} $el - the source of the event `ev`
     * @param {jQuery.Event} ev - the event that was triggered
     */
    verifierAdded: function (context, $el, ev) {
      var user = ev.selectedItem;
      this.verifiersList.attr(user.id, true);
    },

    /**
     * Event handler when a user clicks to remove a verifier from the verifiers
     * list. It removes the corresponding verifier ID from the list.
     *
     * @param {can.Map} context - the Mustache context of the `$el`
     * @param {jQuery.Element} $el - the source of the event `ev`
     * @param {jQuery.Event} ev - the event that was triggered
     */
    verifierRemoved: function (context, $el, ev) {
      var user = ev.person;
      this.verifiersList.removeAttr(String(user.id));
    },

    /**
     * Event handler when a user changes the default assessors option.
     *
     * @param {can.Map} context - the Mustache context of the `$el`
     * @param {jQuery.Element} $el - the source of the event `ev`
     * @param {jQuery.Event} ev - the event that was triggered
     */
    defaultAssesorsChanged: function (context, $el, ev) {
      this._updateDropdownEnabled('assessors');
    },

    /**
     * Event handler when a user changes the default verifiers option.
     *
     * @param {can.Map} context - the Mustache context of the `$el`
     * @param {jQuery.Element} $el - the source of the event `ev`
     * @param {jQuery.Event} ev - the event that was triggered
     */
    defaultVerifiersChanged: function (context, $el, ev) {
      this._updateDropdownEnabled('verifiers');
    },

    /**
     * Update the autocomplete field's disabled flag based on the current value
     * of the corresponding dropdown.
     *
     * @param {String} name - the value to inspect, must be either "assessors"
     *   or "verifiers"
     */
    _updateDropdownEnabled: function (name) {
      var disable = this.attr('default_people.' + name) !== 'other';
      this.attr(name + 'ListDisable', disable);
    },

    /**
     * Pack the "default people" form data into a JSON string.
     *
     * @return {String} - the JSON-packed default people data
     */
    _packPeopleData: function () {
      var data = {};

      /**
       * Create a sorted (ascending) list of numbers from the given map's keys.
       *
       * @param {can.Map} peopleIds - the map to convert
       * @return {Array} - ordered IDs
       */
      function makeList(peopleIds) {
        var result = Object.keys(peopleIds.attr()).map(Number);
        return result.sort(function (x, y) {
          return x - y;
        });
      }

      data.assessors = this.attr('default_people.assessors');
      data.verifiers = this.attr('default_people.verifiers');

      if (data.assessors === 'other') {
        data.assessors = makeList(this.attr('assessorsList'));
      }

      if (data.verifiers === 'other') {
        data.verifiers = makeList(this.attr('verifiersList'));
      }

      return data;
    },

    /**
     * Inspect the default people settings object, convert any lists of
     * user IDs to comma-separated strings, and use that to populate the
     * corresponding text input fields.
     */
    _unpackPeopleData: function () {
      var instance = this;  // the AssessmentTemplate model instance
      var peopleData = instance.default_people;

      ['assessors', 'verifiers'].forEach(function (name) {
        var idsMap;
        var peopleIds = peopleData[name];

        if (peopleIds instanceof can.List) {
          idsMap = new can.Map();
          peopleIds.forEach(function (id) {
            idsMap.attr(id, true);
          });
          instance.attr(name + 'List', idsMap);
          instance.attr('default_people.' + name, 'other');
        } else {
          instance.attr(name + 'List', {});
        }
      });
    },

    /**
     * Return the object types that can be assessed.
     *
     * Used to populate the "Objects under assessment" dropdown on the modal
     * AssessmentTemplate's modal form.
     *
     * @return {Object} - the "assessable" object types
     */
    _choosableObjectTypes: function () {
      var ignoreTypes = this._NON_RELEVANT_OBJ_TYPES;
      var mapper;
      var MapperModel = GGRC.Models.MapperModel;
      var objectTypes;

      mapper = new MapperModel({
        object: 'MultitypeSearch',
        search_only: true
      });
      objectTypes = mapper.initTypes();

      // the all objects group is not needed
      delete objectTypes.all_objects;

      // remove ignored types and sort the rest
      _.each(objectTypes, function (objGroup) {
        objGroup.items = _.filter(objGroup.items, function (item) {
          return !ignoreTypes[item.value];
        });
        objGroup.items = _.sortBy(objGroup.items, 'name');
      });

      // remove the groups that have ended up being empty
      objectTypes = _.pick(objectTypes, function (objGroup) {
        return objGroup.items.length > 0;
      });

      return objectTypes;
    },
    ignore_ca_errors: true
  });
})(window.can, window.CMS);

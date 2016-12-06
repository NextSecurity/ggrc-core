# Copyright (C) 2016 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

API = "api"
DASHBOARD = "dashboard"
ADMIN_DASHBOARD = "admin"
PROGRAMS = "programs"
WORKFLOWS = "workflows"
AUDITS = "audits"
ASSESSMENTS = "assessments"
ISSUES = "issues"
REGULATIONS = "regulations"
POLICIES = "policies"
STANDARDS = "standards"
CONTRACTS = "contracts"
CLAUSES = "clauses"
SECTIONS = "sections"
CONTROLS = "controls"
OBJECTIVES = "objectives"
PEOPLE = "people"
ORG_GROUPS = "org_groups"
VENDORS = "vendors"
ACCESS_GROUPS = "access_groups"
SYSTEMS = "systems"
PROCESSES = "processes"
DATA_ASSETS = "data_assets"
PRODUCTS = "products"
PROJECTS = "projects"
FACILITIES = "facilities"
MARKETS = "markets"
RISKS = "risks"
THREATS = "threats"


class Widget(object):
  # common
  INFO = "#info_widget"
  # admin dashboard page
  CUSTOM_ATTRIBUTES = "#custom_attribute_widget"
  EVENTS = "#events_list_widget"
  ROLES = "#roles_list_widget"
  PEOPLE = "#people_list_widget"

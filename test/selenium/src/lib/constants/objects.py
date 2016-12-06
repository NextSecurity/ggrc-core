# Copyright (C) 2016 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""All objects supported by the app"""

PROGRAMS = "programs"
WORKFLOWS = "workflows"
AUDITS = "audits"
ASSESSMENTS = "assessments"
ISSUES = "issues"
DIRECTIVES = "directives"
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
RISK_ASSESSMENTS = "risk_assessments"

all_objects = (WORKFLOWS, RISK_ASSESSMENTS, THREATS, RISKS,
               PROGRAMS, AUDITS, OBJECTIVES, SECTIONS,
               CONTROLS, ISSUES, ASSESSMENTS, STANDARDS,
               REGULATIONS, POLICIES, CONTRACTS, CLAUSES,
               VENDORS, PEOPLE, ACCESS_GROUPS,
               ORG_GROUPS, PRODUCTS, MARKETS, PROCESSES,
               FACILITIES, PROJECTS, DATA_ASSETS, SYSTEMS)


def _get_singular(plurals):
  """
  Return:
     list of basestring: Capitalized object names in singular form
  """
  singulars = []

  for name in plurals:
    name = name.lower()

    if name == PEOPLE:
      singular = "person"
    elif name == POLICIES:
      singular = "policy"
    elif name == PROCESSES:
      singular = "process"
    elif name == FACILITIES:
      singular = "facility"
    else:
      singular = name[:-1]

    singulars.append(singular.upper())

  return singulars


def get_singular(plural):
  return _get_singular([plural])[0].title()


ALL_PLURAL = [k for k in globals().keys()
              if not k.startswith("_") or k == "ALL"]
ALL_SINGULAR = _get_singular(ALL_PLURAL)


def get_normal_form(obj_name):
  """Transform object name to title form.

  Example:
    risk_assessments -> Risk Assessments
  """
  return obj_name.replace("_", " ").title()

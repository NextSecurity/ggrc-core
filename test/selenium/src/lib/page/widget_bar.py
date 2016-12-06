# Copyright (C) 2016 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""Widget bar models.
We have multiple models for the widget bar since each object can have it's
own rules what is mappable to it"""

from lib import base
from lib import factory
from lib.element import widget_bar
from lib.page.widget import admin_widget
from lib.constants import locator
from lib.constants import element


class _WidgetBar(base.Component):
  """Root class for all widget bars"""

  def __init__(self, driver):
    super(_WidgetBar, self).__init__(driver)

  def get_active_widget_name(self):
    """In general multiple tabs are open. Here we get the name of the
    active one.

    Returns:
         str
    """
    active_widget = base.Button(self._driver, locator.WidgetBar.TAB_WIDGET)
    return active_widget.text


class _ObjectWidgetBar(_WidgetBar):
  """Model for a generic object widget bar (e.g. each info widget is object
  specific"""

  def __init__(self, driver):
    super(_ObjectWidgetBar, self).__init__(driver)
    self.button_add_widget = base.Dropdown(driver,
                                           locator.WidgetBar.BUTTON_ADD)
    self.tab_info = base.Tab(self._driver, locator.WidgetBar.INFO)

  def _get_widget(self, widget_name):
    """Adds an attribute, clicks on the relevant tab and returns relevant
    widget"""
    attr_name = "tab_" + widget_name
    setattr(
        self,
        attr_name,
        widget_bar.Tab(self._driver, factory.get_locator_widget(widget_name)))
    getattr(self, attr_name).click()
    return factory.get_cls_widget(widget_name)(self._driver)

  def add_widget(self):
    """
    Returns:
        lib.element.widget_bar.AddWidget
    """
    self.button_add_widget.click()
    return widget_bar.AddWidget(self._driver)

  def select_info(self):
    """Selects the info widget/tab. Note that each object has a different info
    page"""
    self.tab_info.click()
    return factory.get_cls_widget(
        self.__class__.__name__.lower(), is_info=True)(self._driver)

  def select_controls(self):
    """
    Returns:
        lib.page.widget.generic_widget.Controls
    """
    return self._get_widget(element.WidgetBar.CONTROLS)

  def select_issues(self):
    """
    Returns:
        lib.page.widget.generic_widget.Issues
    """
    return self._get_widget(element.WidgetBar.ISSUES)

  def select_processes(self):
    """
    Returns:
        lib.page.widget.generic_widget.Processes
    """
    return self._get_widget(element.WidgetBar.PROCESSES)

  def select_data_assets(self):
    """
    Returns:
        lib.page.widget.generic_widget.DataAssets
    """
    return self._get_widget(element.WidgetBar.DATA_ASSETS)

  def select_systems(self):
    """
    Returns:
        lib.page.widget.generic_widget.Systems
    """
    return self._get_widget(element.WidgetBar.SYSTEMS)

  def select_products(self):
    """
    Returns:
        lib.page.widget.generic_widget.Products
    """
    return self._get_widget(element.WidgetBar.PRODUCTS)

  def select_projects(self):
    """
    Returns:
        lib.page.widget.generic_widget.Projects
    """
    return self._get_widget(element.WidgetBar.PROJECTS)

  def select_programs(self):
    """
    Returns:
        lib.page.widget.generic_widget.Programs
    """
    return self._get_widget(element.WidgetBar.PROGRAMS)


class AdminDashboard(_WidgetBar):
  """A model representing widget bar as seen only on admin dashboard"""

  def __init__(self, driver):
    super(AdminDashboard, self).__init__(driver)
    self.tab_people = widget_bar.Tab(self._driver,
                                     locator.WidgetBar.ADMIN_PEOPLE)
    self.tab_roles = widget_bar.Tab(self._driver,
                                    locator.WidgetBar.ADMIN_ROLES)
    self.tab_events = widget_bar.Tab(self._driver,
                                     locator.WidgetBar.ADMIN_EVENTS)
    self.tab_custom_attributes = widget_bar.Tab(
        self._driver, locator.WidgetBar.ADMIN_CUSTOM_ATTRIBUTE)

  def select_people(self):
    """
    Returns:
        lib.page.widget.admin_widget.People
    """
    self.tab_people.click()
    return admin_widget.People(self._driver)

  def select_roles(self):
    """
    Returns:
        lib.page.widget.admin_widget.Roles
    """
    self.tab_roles.click()
    return admin_widget.Roles(self._driver)

  def select_events(self):
    """
    Returns:
        lib.page.widget.admin_widget.Events
    """
    self.tab_events.click()
    return admin_widget.Events(self._driver)

  def select_custom_attributes(self):
    """
    Returns:
        lib.page.widget.admin_widget.CustomAttributes
    """
    self.tab_custom_attributes.click()
    return admin_widget.CustomAttributes(self._driver)


class Dashboard(_ObjectWidgetBar):
  """A model representing widget bar on user's dashboard"""


class Programs(_ObjectWidgetBar):
  """A model representing widget bar of the program object"""


class Workflows(_ObjectWidgetBar):
  """A model representing widget bar of the workflow object"""


class Audits(_ObjectWidgetBar):
  """A model representing widget bar of the audit object"""


class Assessments(_ObjectWidgetBar):
  """A model representing widget bar of the Assessments object"""


class Issues(_ObjectWidgetBar):
  """A model representing widget bar of the workflow object"""


class Regulations(_ObjectWidgetBar):
  """A model representing widget bar of the regulations object"""


class Policies(_ObjectWidgetBar):
  """A model representing widget bar of the policies object"""


class Standards(_ObjectWidgetBar):
  """A model representing widget bar of the standards object"""


class Contracts(_ObjectWidgetBar):
  """A model representing widget bar of the contract object"""


class Clauses(_ObjectWidgetBar):
  """A model representing widget bar of the clauses object"""


class Sections(_ObjectWidgetBar):
  """A model representing widget bar of the section object"""


class Controls(_ObjectWidgetBar):
  """A model representing widget bar of the controls object"""


class Objectives(_ObjectWidgetBar):
  """A model representing widget bar of the objectives object"""


class People(_ObjectWidgetBar):
  """A model representing widget bar of the people object"""


class OrgGroups(_ObjectWidgetBar):
  """A model representing widget bar of the OrgGroups object"""


class Vendors(_ObjectWidgetBar):
  """A model representing widget bar of the vendors object"""


class AccessGroups(_ObjectWidgetBar):
  """A model representing widget bar of the access group object"""


class Systems(_ObjectWidgetBar):
  """A model representing widget bar of the system object"""


class Processes(_ObjectWidgetBar):
  """A model representing widget bar of the process object"""


class DataAssets(_ObjectWidgetBar):
  """A model representing widget bar of the data asset object"""


class Products(_ObjectWidgetBar):
  """A model representing widget bar of the product object"""


class Projects(_ObjectWidgetBar):
  """A model representing widget bar of the project object"""


class Facilities(_ObjectWidgetBar):
  """A model representing widget bar of the facility object"""


class Markets(_ObjectWidgetBar):
  """A model representing widget bar of the market object"""


class Risks(_ObjectWidgetBar):
  """A model representing widget bar of the risk object"""


class Threats(_ObjectWidgetBar):
  """A model representing widget bar of the threat object"""

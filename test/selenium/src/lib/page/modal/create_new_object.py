# Copyright (C) 2016 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""Models for LHN modals when creating new objects"""

from lib import base
from lib import decorator
from lib.constants import locator
from lib.page.modal import base as modal_base


class _CreateNewObjectModal(modal_base.BaseModal):
  """Base create modal model"""
  _locator_button_add_another = locator.ModalCreateNewObject \
      .BUTTON_SAVE_AND_ADD_ANOTHER

  def __init__(self, driver):
    super(_CreateNewObjectModal, self).__init__(driver)
    self.button_save_and_add_another = base.Button(
        driver, self._locator_button_add_another)

  def save_and_add_other(self):
    """Saves this objects and opens a new modal"""
    self.button_save_and_add_another.click()
    return self.__class__(self._driver)

  @decorator.wait_for_redirect
  @decorator.handle_alert
  def save_and_close(self):
    """Saves this object"""
    self.button_save_and_close.click()


class Programs(modal_base.ProgramsModal, _CreateNewObjectModal):
  """Class representing a program modal"""


class Controls(modal_base.ControlsModal, _CreateNewObjectModal):
  """Class representing a control modal"""


class OrgGroups(modal_base.OrgGroupsModal, _CreateNewObjectModal):
  """Class representing an org group modal"""


class Risks(modal_base.RisksModal, _CreateNewObjectModal):
  """Class representing a risk modal"""


class Issues(modal_base.IssuesModal, _CreateNewObjectModal):
  """Class representing an issue modal"""


class Processes(modal_base.ProcessesModal, _CreateNewObjectModal):
  """Class representing a process modal"""


class DataAssets(modal_base.DataAssetsModal, _CreateNewObjectModal):
  """Class representing a Data Assets modal"""


class Systems(modal_base.SystemsModal, _CreateNewObjectModal):
  """Class representing a system modal"""


class Products(modal_base.ProductsModal, _CreateNewObjectModal):
  """Class representing a product modal"""


class Projects(modal_base.ProjectsModal, _CreateNewObjectModal):
  """Class representing a process modal"""

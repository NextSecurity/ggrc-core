# Copyright (C) 2016 Google Inc.
# Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>

"""
Utility classes for page objects used in tests.

Details:
Most of the tests require a sequence of primitive methods of the page
object. If the sequence repeats itself among tests, it should be shared in
this module.
"""

import uuid
import re

from lib import base
from lib.constants.test import modal_create_new
from lib.constants.test import modal_custom_attribute


def append_random_string(text):
  return text + str(uuid.uuid4())


def prepend_random_string(text):
  return str(uuid.uuid4()) + text


class HtmlParser(object):
  """The HtmlParser class simulates what happens with (non-rich)text in HTML.
  """
  @staticmethod
  def parse_text(text):
    """Simulates text parsed by html

    Args:
      text (basestring)
    """
    return re.sub(r'\s+', " ", text)


class ModalInput(base.TestUtil):
  """Base class for filling out modals"""
  @staticmethod
  def enter_test_data(modal):
    modal.enter_title(append_random_string(modal_create_new.SHORT_TITLE))


class ModalNewControls(ModalInput):
  """Methods for simulating common user actions"""

  @staticmethod
  def enter_test_data(modal):
    """Fills out all fields in the lhn_modal

    Args:
        modal (lib.page.lhn_modal.new_control.Controls)
    """
    modal.enter_title(append_random_string(modal_create_new.SHORT_TITLE))
    modal.enter_description(append_random_string(
        modal_create_new.SHORT_TITLE))
    modal.enter_test_plan(append_random_string(
        modal_create_new.SHORT_TITLE))
    modal.enter_notes(append_random_string(modal_create_new.SHORT_TITLE))
    modal.enter_code(append_random_string(modal_create_new.SHORT_TITLE))


class ModalNewPrograms(ModalInput):
  """Methods for simulating common user actions"""

  @staticmethod
  def set_start_end_dates(modal, day_start, day_end):
    """
    Sets the dates from the datepicker in the new program/edit modal.

    Args:
      modal (lib.page.modal.edit_object.Programs)
      day_start (int): for more info see
        base.DatePicker.select_day_in_current_month
      day_end (int): for more info see
        base.DatePicker.select_day_in_current_month
    """
    modal.enter_effective_date_start_month(day_start)
    modal.enter_stop_date_end_month(day_end)

  @staticmethod
  def enter_test_data(modal):
    """Fills out all fields in the lhn_modal

    Args:
        modal (lib.page.modal.edit_object.Programs)
    """
    modal.enter_title(append_random_string(modal_create_new.SHORT_TITLE))
    modal.enter_description(append_random_string(
        modal_create_new.SHORT_TITLE))
    modal.enter_notes(append_random_string(modal_create_new.SHORT_TITLE))
    modal.enter_code(append_random_string(modal_create_new.SHORT_TITLE))
    modal.filter_and_select_primary_contact("example")
    modal.filter_and_select_secondary_contact("example")
    modal.enter_program_url(prepend_random_string(
        modal_create_new.Program.PROGRAM_URL))
    modal.enter_reference_url(prepend_random_string(
        modal_create_new.Program.REFERENCE_URL))

    ModalNewPrograms.set_start_end_dates(modal, 0, -1)


class ModalNewProgramCustomAttribute(ModalInput):
  @staticmethod
  def enter_test_data(modal):
    """Fills out all fields in the lhn_modal

    Args:
        modal (lib.page.modal.custom_attribute.ModalCustomAttributes)
    """
    modal.enter_title(append_random_string(
        modal_custom_attribute.Program.TITLE))
    modal.enter_inline_help(append_random_string(
        modal_custom_attribute.Program.INLINE_HELP))
    modal.enter_placeholder(append_random_string(
        modal_custom_attribute.Program.PLACEHOLDER))


class ModalNewOrgGroups(ModalInput):
  """Utils for data entry for org group modal"""


class ModalNewRisks(ModalInput):
  """Utils for data entry for risk modal"""
  @staticmethod
  def enter_test_data(modal):
    """Fills out all fields in the lhn_modal

    Args:
        modal (lib.page.modal.edit_object.EditRisksModal)
    """
    modal.enter_title(append_random_string(
        modal_create_new.SHORT_TITLE))
    modal.enter_description(append_random_string(
        modal_create_new.SHORT_TITLE))


class ModalNewIssues(ModalInput):
  """Utils for data entry for issues modal"""


class ModalNewProcesses(ModalInput):
  """Utils for data entry for process modal"""


class ModalNewDataAssets(ModalInput):
  """Utils for data entry for data asset modal"""


class ModalNewSystems(ModalInput):
  """Utils for data entry for system modal"""


class ModalNewProducts(ModalInput):
  """Utils for data entry for product modal"""


class ModalNewProjects(ModalInput):
  """Utils for data entry for project modal"""

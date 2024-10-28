#!/usr/bin/env python3
"""
Takes two integer arguments page and page_size.
"""


def index_range(page: int, page_size: int) -> tuple:
    """
    Calculate the start and end index for a given
    page and page size.

    Args:
        page (int): The current page number (1-indexed).
        page_size (int): The number of items per page.

    Returns:
        tuple: A tuple containing the start and end
        indexes for the items in the page.
    """
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    return start_index, end_index

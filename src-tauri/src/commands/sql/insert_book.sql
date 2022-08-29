INSERT INTO books (
    epub_path,
    cover_path,
    meta_title,
    meta_creator,
    meta_description,
    meta_pubdate,
    meta_publisher,
    meta_identifier,
    meta_language,
    meta_rights,
    meta_modified_date,
    meta_layout,
    meta_orientation,
    meta_flow,
    meta_viewport,
    meta_spread
) VALUES (
    :epub_path,
    :cover_path,
    :meta_title,
    :meta_creator,
    :meta_description,
    :meta_pubdate,
    :meta_publisher,
    :meta_identifier,
    :meta_language,
    :meta_rights,
    :meta_modified_date,
    :meta_layout,
    :meta_orientation,
    :meta_flow,
    :meta_viewport,
    :meta_spread
) RETURNING book_id;

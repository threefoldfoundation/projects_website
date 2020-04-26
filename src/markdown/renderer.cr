module Markdown::Renderer
    abstract def begin_paragraph(prefix)
    abstract def end_paragraph
    abstract def begin_italic(one_underscore)
    abstract def end_italic(one_underscore)
    abstract def begin_bold(two_underscores) 
    abstract def end_bold(two_underscores)
    abstract def begin_header(level)
    abstract def end_header(level)
    abstract def begin_inline_code
    abstract def end_inline_code
    abstract def begin_code(language)
    abstract def end_code
    abstract def begin_quote
    abstract def end_quote
    abstract def begin_unordered_list(prefix)
    abstract def end_unordered_list
    abstract def begin_ordered_list(prefix)
    abstract def end_ordered_list
    abstract def begin_list_item(prefix)
    abstract def end_list_item
    abstract def begin_link(url)
    abstract def end_link
    abstract def image(url, alt)
    abstract def text(text)
    abstract def horizontal_rule(hr)
  end
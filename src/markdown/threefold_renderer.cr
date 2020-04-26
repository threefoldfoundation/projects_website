require "./renderer"



class Markdown::ThreefoldRender
  include Renderer

  @URL = ""
  @NEXT_LINE = ""
  @UNORDERED : Bool = false

  def initialize(@io : IO)
  end

  def begin_paragraph(prefix)
    @io << prefix
  end
  def end_paragraph; end

  def begin_italic(one_underscore)
    if one_underscore
      @io << "_"
    else
      @io << "*"
    end
  end

  def end_italic(one_underscore)
    if one_underscore
      @io << "_"
    else
      @io << "*"
    end
  end

  def begin_bold(two_underscores)
    if two_underscores
      @io << "__"
    else
      @io << "**"
    end
  end

  def end_bold(two_underscores)
    if two_underscores
      @io << "__"
    else
      @io << "**"
    end
  end

  def begin_header(level, next_line="")
    if next_line != ""
      @NEXT_LINE = next_line
    else
      @io << "#" * level + " "
    end
  end

  def end_header(level)
    if @NEXT_LINE != ""
      @io << "\n" + @NEXT_LINE
    end
    @NEXT_LINE = ""
  end

  def begin_inline_code
    @io << "`"
  end

  def end_inline_code
    @io << "`"
  end

  def begin_code(language)
    if language.nil?
      @io << "```\n"
    else
      @io << "```#{language}\n"
    end
  end

  def end_code
    @io << "\n```"
  end

  def begin_quote
    @io << "> "
  end

  def end_quote; 
    
  end

  def begin_unordered_list(line)
    @io << line
  end

  def end_unordered_list
    
  end

  def begin_ordered_list(prefix)
    @io << prefix
  end

  def end_ordered_list
  end

  def begin_list_item(line)
      # @io << line
  end

  def end_list_item
    @io << '\n'
  end

  def begin_link(url)
    @io << "["
    @URL=url    
  end

  def end_link
    @io << "](#{@URL})"
    @URL = ""
  end

  def image(url, alt)
    @io << "![#{alt}](#{url})"
  end

  def text(text)
    @io << text
  end

  def horizontal_rule(hr)
    @io << "#{hr}\n"
  end
end
require "./renderer"
require "toml"


class Markdown::ThreefoldRender
  include Renderer

  @URL = ""
  @NEXT_LINE = ""
  @URL = false
  @CODES = Array(String).new
  @CODE=false
  @CODE_BLOCK =  String::Builder.new

  # parse codes, return objects
  def codes: Array(String)
    @CODES
    res = Array(String).new
    @CODES.each do |item|
      if ! item.includes?("[milestone]")
          res.push(item)
          next
      end

      offsets = Array(Int32).new
      current_offset = 0
      while true
        offset = item.index("[milestone]", current_offset)
        if offset == nil
          break
        end
        offsets.push(offset.not_nil!)
        current_offset = offset.not_nil! + "[milestone]".size
      end

      start_end = []of Tuple(Int32, Int32)
      offsets.each_with_index do |off, i|
        if i+1 == offsets.size
          start_end.push ({offsets[i], item.size-1})
          next
        end
        start_end.push ({offsets[i], offsets[i+1]-1})
      end

      start_end.each do |se|
        s, e = se
        res.push(item[s..e])
      end
    end
    res
  end

  def st
    return @io.to_s
  end
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
    @CODE=true
    if language.nil?
      @io << "```\n"
    else
      @io << "```#{language}\n"
    end
  end

  def end_code
    @CODE=false
    @CODES.push(@CODE_BLOCK.to_s)
    @CODE_BLOCK = String::Builder.new
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
    if @CODE
      @CODE_BLOCK << text
    else

    end
    @io << text
  end

  def horizontal_rule(hr)
    @io << "#{hr}\n"
  end
end
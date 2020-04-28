# Markdown library parses Markdown text. It supports rendering to HTML text.
#
# Usage:
#
# ```
# require "markdown"
#
# text = "## This is title \n This is a [link](http://crystal-lang.org)"
#
# Markdown.to_html(text)
# # => <h2>This is title</h2>
# # => <p>This is a <a href="http://crystal-lang.org">link</a></p>
# ```
#
# NOTE: This library is in its early stage. Many features are still in development.
class Markdown
    def self.parse(text, renderer)
      parser = Parser.new(text, renderer)
      parser.parse
    end

    def self.to_tf_markdown(text)
        String.build do |io|
          renderer = Markdown::ThreefoldRender.new(io)
          parse text, renderer
          return renderer.st, renderer.codes
        end
      end
  end
  
  require "./markdown/*"
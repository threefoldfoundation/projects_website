require "json"
require "../markdown"

class MdPage
    JSON.mapping(
        name: String,
        path: String,
        content: String,
        category: String
    )

    def initialize (@name="", @path="", @content="", @category="")
    
    end

    def parse
        Markdown.to_tf_markdown @content
    end

end

class Item
    JSON.mapping(
        name: String,
        pages: Array(MdPage)
    )

    def initialize (@name, @pages=Array(MdPage).new); end
end

class Websites
    JSON.mapping(
        items: Hash(String, Array(Item))
    )
    def initialize (@items=Hash(String, Array(Item)).new); end

end

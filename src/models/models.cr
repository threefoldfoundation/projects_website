require "json"

class Page
    JSON.mapping(
        name: String,
        path: String,
        content: String
    )

    def initialize (@name="", @path="", @content=""); end
end


class Item
    JSON.mapping(
        name: String,
        pages: Array(Page)
    )

    def initialize (@name, @pages=Array(Page).new); end
end

class Websites
    JSON.mapping(
        items: Hash(String, Array(Item))
    )
    def initialize (@items=Hash(String, Array(Item)).new); end

end

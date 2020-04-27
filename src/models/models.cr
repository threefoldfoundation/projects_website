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


class Project
    JSON.mapping(
        name: String,
        pages: Array(MdPage)
    )

    def initialize (@name, @pages=Array(MdPage).new); end
end

class User
    JSON.mapping(
        name: String,
        pages: Array(MdPage)
    )

    def initialize (@name, @pages=Array(MdPage).new); end

end

class Websites
    JSON.mapping(
        projects: Array(Project),
        people: Array(User) ,
    )
    def initialize (@projects=Array(Project).new, @people=Array(User).new); end

end

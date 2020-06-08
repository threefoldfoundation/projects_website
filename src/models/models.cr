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
        st, codes = Markdown.to_tf_markdown @content
        x = codes.as(Array(String))
        res = Array(Hash(String, TOML::Type)).new
        s = x.size
        (0..s-1).each do |idx|
            begin
                toml = TOML.parse(x[idx])
                res.push(toml)
                @content = @content.gsub(x[idx], "")
                @content = @content.gsub("### data", "")
                @content = @content.gsub("### Roadmap", "")
                @content = @content.gsub("```python\n\n```", "")
                @content = @content.gsub("```python\n\n\n```", "")
                @content = @content.gsub("```\n\n```", "")
                first_line = @content.lines[0]
                @content = @content.gsub(first_line, "")
                
            rescue exception
                puts "*******************\n"
                puts "failed to parse code as toml\n" 
                puts "*******************\n" 
                puts x[idx] 
            end
            
        end
        return st, res
    end

end

class MileStone
    JSON.mapping(
        name: String,
        date: String,
        funding_required_tft: String,
        funding_required_usd: String,
        description: String
    )

    def initialize(@name="", @date="", @funding_required_tft="", @funding_required_usd="", @description="");end
end

class ProjectEcoSystem
    JSON.mapping(
        categories: Array(String),
        badges: Array(String)
    )

    def initialize(@categories=Array(String).new, @badges=Array(String).new);end
end


class ProjectInfo
    JSON.mapping(
        name: String,
        team: Array(String),
        countries: Array(Country),
        cities: Array(City),
        mission: String,
        description: String,
        rank: Int64
    )

    def initialize(@name="", @team=Array(String).new, @cities=Array(City).new, @countries=Array(Country).new, @mission="", @description="", @rank=1_i64);end

end


class Project
    JSON.mapping(
        name: String,
        links: Links,
        ecosystem: ProjectEcoSystem,
        pages: Array(MdPage),
        info: ProjectInfo,
        milestones: Array(MileStone)
    )

    def initialize (@name, @pages=Array(MdPage).new, @links=Links.new, @ecosystem=ProjectEcoSystem.new, @info=ProjectInfo.new, @milestones=Array(MileStone).new); end
end


class Country
    JSON.mapping(
        name: String
    )

    def initialize(@name="");end
end


class Company
    JSON.mapping(
        name: String
    )

    def initialize(@name="");end
end

class City
    JSON.mapping(
        name: String
    )

    def initialize(@name="");end
end




class UserInfo
    JSON.mapping(
        name: String,
        bio: String,
        companies: Array(Company),
        countries: Array(Country),
        cities: Array(City)
    )

    def initialize(@name="", @bio="", @companies=Array(Company).new, @cities=Array(City).new, @countries=Array(Country).new);end

end


class Links
    JSON.mapping(
        linkedin: String,
        websites: Array(String),
        wiki: String,
        video: String,
        logo_path: String,
        image_path: String,
        card_path: String
    )

    def initialize(@linkedin="", @websites=Array(String).new, @wiki="", @video="", @image_path="", @logo_path="", @card_path="");end

end

class UserEcoSystem
    JSON.mapping(
        memberships: Array(String)
    )

    def initialize(@memberships=Array(String).new);end
end

class User
    JSON.mapping(
        name: String,
        pages: Array(MdPage),
        info: UserInfo,
        links: Links,
        ecosystem: UserEcoSystem
    )

    def initialize (@name, @pages=Array(MdPage).new, @info=UserInfo.new, @links=Links.new, @ecosystem=UserEcoSystem.new); end
end

class Websites
    JSON.mapping(
        projects: Array(Project),
        people: Array(User) ,
    )
    def initialize (@projects=Array(Project).new, @people=Array(User).new); end
end

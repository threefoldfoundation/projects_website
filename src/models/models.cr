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

class MileStone
    JSON.mapping(
        name: String,
        date: String,
        funding_required_tft: Int32,
        funding_required_usd: Int32,
        description: String
    )

    def initialize(@name="", @date="", @funding_required_tft=0, @funding_required_usd=0, @description="");end
end

class ProjectEchosystem
    JSON.mapping(
        categories: Array(String),
        badges: Array(String)
    )

    def initialize(@categories=Array(String).new, @badges=Array(String).new);end
end


class ProjectInfo
    JSON.mapping(
        team: String,
        countries: Array(Country),
        cities: Array(City)
    )

    def initialize(@team="", @cities=Array(City).new, @countries=Array(Country).new);end

end


class Project
    JSON.mapping(
        name: String,
        links: Links,
        echosystem: ProjectEchosystem,
        pages: Array(MdPage),
        info: ProjectInfo,
        milestones: Array(MileStone)
    )

    def initialize (@name, @pages=Array(MdPage).new, @links=Links.new, @echosystem=ProjectEchosystem.new, @info=ProjectInfo.new, @milestones=Array(MileStone).new); end
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
        video: String
    )

    def initialize(@linkedin="", @websites=Array(String).new, @video="");end

end

class UserEchosystem
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
        echosystem: UserEchosystem
    )

    def initialize (@name, @pages=Array(MdPage).new, @info=UserInfo.new, @links=Links.new, @echosystem=UserEchosystem.new); end
end

class Websites
    JSON.mapping(
        projects: Array(Project),
        people: Array(User) ,
    )
    def initialize (@projects=Array(Project).new, @people=Array(User).new); end

end

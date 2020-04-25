require "kemal"
require "json"
require "./models/"

CURR_PATH = Dir.current + "/public/threefold/info"

WEBSITES = Websites.new

def _walk(path : String = CURR_PATH)
  relative_path = Path.new path.gsub(CURR_PATH, "")
  path_parts = relative_path.parts
  if path_parts.size > 0
    path_parts.shift
  end
  level = path_parts.size
  Dir.children(path).each do |name|
    if name == ".git"
      next
    end
    if ! File.file? path + "/" + name
      if level == 0
        WEBSITES.items[name] =  Array(Item).new
      elsif level == 1
        items = WEBSITES.items[path_parts[0]]
        item = Item.new name 
        items.push item
      end
      _walk( path + "/" + name)
    else
      if level == 2
        items = WEBSITES.items[path_parts[0]]
        items.each do |item|
          if item.name == path_parts[1]
            path = Dir.current + "/public/threefold/info" + "/" + path_parts[0] + "/" + path_parts[1] + "/" + name
            page = Page.new name.gsub(".md", ""),  path, File.read(path)
            item.pages.push(page)
          end
        end
      end
    end
  end
end

get "/data" do |env|
  _walk 
  env.response.headers.add("Access-Control-Allow-Origin", "*")
  WEBSITES.to_json
end

Kemal.run

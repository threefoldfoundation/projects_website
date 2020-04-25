# walker

Simple Api server which parses markedown docs and return it in structured way

## Usage (DEV)

**Clone repo  https://github.com/threefoldfoundation/www_threefold_ecosystem into `public/threefold`

- Frontend
	```

	cd src/frontend
	npm run dev
	```

- Backend

	```
	crystal run src/walker.cr
	```

## To build Frontend for production use
```
./build.sh
```

## Data structure

For now simple call to `/data` returns all data

- Root dir is `public/threefold/info/` 

- Data format is like
	```
	{"items":
		{"projects":
			[
				{"name":"ff_connect",
				"pages":[
					{"name":"ff_connect",
					"path":"/home/hamdy/crystal/websites/walker/public/threefold/info/projects/ff_connect/ff_connect.md",
					"content":"# FF Data"
					}
				]
				}
			]
		}
	}
	```


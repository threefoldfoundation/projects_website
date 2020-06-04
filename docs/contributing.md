



# walker

Simple Api server which parses markedown docs and return it in structured way


## Usage (DEV)

**Clone data repo  https://github.com/threefoldfoundation/data_threefold_projects_friends into `public/threefold`

- Frontend
	```

	cd src/frontend
	npm run dev
	```

- Backend

	```
	shards install
	crystal run src/walker.cr
	```

## To build Frontend for production use
```
./build.sh
```

`then open 127.0.0.1:3000/`

## Testing
```
KEMAL_ENV=test crystal spec
```

## Run behind caddy
```
sudo caddy run
```

## Production
```
cd public
 git clone https://github.com/threefoldfoundation/www_threefold_ecosystem threefold
 cd -
./build.sh
./run.sh
```

## Data structure

For now simple call to `/data` returns all data, use a `json` plugin in your browser i you want to see it in pretty format

- Root dir is `public/threefold/info/` 

- Data format is like
	```
	{"projects":
			[
				{
					name: "threefold stellar",
					links: {
						linkedin: "https://www.linkedin.com/company/stellar-development-foundation/",
						websites: ["http://stellar.org/"],
						wiki: "",
						video: "",
						image_path: "/threefold/info/projects/threefold_stellar/threefold_stellar.png"
					},
					ecosystem: {
						categories: ["solutionprovider"],
						badges: [ ]
					},
					pages: [
						{
							name: "threefold_stellar",
							path: "/home/hamdy/crystal/walker/public/threefold/info/projects/threefold_stellar/threefold_stellar.md",
							content: "# ThreeFold Stellar ### Roadmap .....",
							category: ""
						}
					],
					info: {
						team: [
							"Adnan Fatayerji",
							"Boris Reznikov",
							"Sam Taggart",
							"Rob Van Mieghem",
							"Geert Machtelinckx",
							"Nickolay Babenko"
						],
					countries: [
						{
							name: "UAE"
						},
						{
							name: "USA"
						},
						{
							name: "Belgium"
						},
						{
							name: "Egypt"
						},
						{
							name: "Ukraine"
						}
						],
					cities: [
						{
							name: "Dubai"
						},
						{
							name: "San Francisco"
						},
						{
							name: "Luxor"
						},
						{
							name: "Ghent"
						},
						{
							name: "Kyiv"
						}
					],
					mission: ".........."
					},
					milestones: [
						{
							name: "ThreeFold Token implementation on Stellar Network",
							date: "2020/03",
							funding_required_tft: "100",
							funding_required_usd: "15,000",
							description: "ThreeFold Token implementation on the Stellar Network: software development, required for the integration"
						},
						{
							name: "Token Holders Migration start",
							date: "2020/05",
							funding_required_tft: "0",
							funding_required_usd: "5,000",
							description: "Clear and simple procedure for the ThreeFold Token migration should be developed, described and announced for all token holders. Clear manuals and wiki articles on the topic should be composed."
						},					
					]
					}
			]
	"people":[

				{
					name: "anna_allen",
					pages: [
						{
							name: "anna_allen",
							path: "/home/hamdy/crystal/walker/public/threefold/info/people/anna_allen/anna_allen.md",
							content: "......",
							category: ""
						}
					],
					info: {
						name: "Anna Allen",
						bio: "",
						companies: [{name: ""}],
						countries: [{name: ""}],
						cities: [{name: ""}]
					},
					links: {
						linkedin: "",
						websites: [""],
						wiki: "",
						video: "",
						image_path: ""
					},
					ecosystem: {
						memberships: [""]
					}
				},
	]
	}
	```


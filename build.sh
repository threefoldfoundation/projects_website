cd src/frontend
npm install
npm run build
echo "copying data into public"
cp -r public/* ../../public
echo "DONE"
echo "\n"
echo "build for production"
cd -
shards install
crystal build --release src/walker.cr
echo "DONE"

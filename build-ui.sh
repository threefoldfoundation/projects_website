cd src/frontend
npm run build
echo "copying data into public"
cp -r public/* ../../public
echo "DONE"


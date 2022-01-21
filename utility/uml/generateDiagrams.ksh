#!/bin/ksh

targetdir="$(pwd)/public/assets/diagrams"
umljar="plantuml-1.2022.0.jar"

rm -rf "$targetdir/*"
cp $(pwd)/writeup/diagrams/*.png $targetdir

for diag in $(find . -path "node_modules" -prune -o -name "*.puml" -print); do
	ofilename="$(basename $diag .puml).png"

	java -jar "utility/uml/$umljar" $diag -o $targetdir
	echo "Compiled $diag to $targetdir/$ofilename"
done

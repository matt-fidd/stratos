#!/bin/ksh

targetdir="$(pwd)/static/assets/diagrams"

rm -rf "$targetdir/*"
cp $(pwd)/writeup/diagrams/*.png $targetdir

for diag in $(find . -path "node_modules" -prune -o -name "*.puml" -print); do
	ofilename="$(basename $diag .puml).png"

	java -jar "utility/uml/plantuml-1.2021.13.jar" $diag -o $targetdir
	echo "Compiled $diag to $targetdir/$ofilename"
done

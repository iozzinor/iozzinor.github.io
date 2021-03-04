#!/bin/bash

# the glossary list is stored in "$input_glossary"
# it should be a CSV file
# the first field is the line unique identifier, the second the entry word and the last one the definition

current_dir=$(realpath $(dirname $0))
target_dir=$(dirname "$current_dir")'/dental-courses/internat'
target_file="$target_dir/glossary.html"

input_glossary="$current_dir/input_glossary.csv"

cat << 'END_OF_FILE' > "$target_file"
<!DOCTYPE HTML>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Lexique</title>
		<link rel="stylesheet" href="/Styles/main.css" />
		<link rel="stylesheet" href="/Styles/dental-courses/internat/glossary.css" />
	</head>
	<body>
		<header><a class="home" href="/"></a></header>
		<main>
			<h1>Lexique</h1>
			<table>
				<tr>
					<th>Nom</th><th>Définition</th>
				</tr>
END_OF_FILE

# sort the csv using the second column (word) then display a tr line:
# set the line id to allow anchors ;
# add a class to the TR tag to define whether the row is odd or even
sort -k 2 -t ',' "$input_glossary" | awk -F '[,]' '{ printf("\t\t\t\t<tr id=\"%s\" class=\"%s\"><td>%s</td><td>%s</td></tr>\n", $1, NR % 2 == 0 ? "even" : "odd", $2, $3) }' >> "$target_file"

cat << 'END_OF_FILE' >> "$target_file"
			</table>
		</main>
		<script src="/Scripts/theme.js"></script>
		<script src="/Scripts/dental-courses/internat/glossary.js"></script>
	</body>
</html>
END_OF_FILE

#!/bin/bash

# Create directory structure
mkdir -p public/images/{avatars,cards,icons,ui}

echo "Organizing Midjourney assets..."

# Counter for naming
male_counter=21
female_counter=21
card_counter=37
icon_counter=1

# Copy and rename male avatars
for file in demo/public/mijo/*confident_mid*; do
    if [[ -f "$file" ]]; then
        cp "$file" "public/images/avatars/male-${male_counter}.jpg"
        echo "Copied male avatar: male-${male_counter}.jpg"
        ((male_counter++))
    fi
done

# Copy and rename female avatars  
for file in demo/public/mijo/*confident_wom*; do
    if [[ -f "$file" ]]; then
        cp "$file" "public/images/avatars/female-${female_counter}.jpg"
        echo "Copied female avatar: female-${female_counter}.jpg"
        ((female_counter++))
    fi
done

# Copy and rename background cards
for file in demo/public/mijo/*abstract_geometric*; do
    if [[ -f "$file" ]]; then
        cp "$file" "public/images/cards/${card_counter}-640x480.jpg"
        echo "Copied background card: ${card_counter}-640x480.jpg"
        ((card_counter++))
    fi
done

# Copy and rename dashboard icons
for file in demo/public/mijo/*dashboard_ana*; do
    if [[ -f "$file" ]]; then
        cp "$file" "public/images/icons/dashboard-${icon_counter}.png"
        echo "Copied dashboard icon: dashboard-${icon_counter}.png"
        ((icon_counter++))
    fi
done

# Copy and rename file type icons
file_icon_counter=1
for file in demo/public/mijo/*file_type_icons*; do
    if [[ -f "$file" ]]; then
        cp "$file" "public/images/icons/file-types-${file_icon_counter}.png"
        echo "Copied file type icon: file-types-${file_icon_counter}.png"
        ((file_icon_counter++))
    fi
done

echo "Asset organization complete!"
echo "Male avatars: $(ls public/images/avatars/male-* 2>/dev/null | wc -l)"
echo "Female avatars: $(ls public/images/avatars/female-* 2>/dev/null | wc -l)"
echo "Background cards: $(ls public/images/cards/*-640x480.jpg 2>/dev/null | wc -l)"
echo "Dashboard icons: $(ls public/images/icons/dashboard-* 2>/dev/null | wc -l)"
echo "File type icons: $(ls public/images/icons/file-types-* 2>/dev/null | wc -l)"

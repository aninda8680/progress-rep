from PIL import Image

# Open the original image
img = Image.open('public/codepanti.png')
img = img.convert("RGBA")

# getbbox() finds the bounding box of non-zero alpha regions
bbox = img.getbbox()

if bbox:
    # Crop the image to the bounding box
    cropped = img.crop(bbox)
    
    # Save it as the new favicon in the app router folder
    cropped.save('app/icon.png')
    print("Successfully cropped and saved to app/icon.png")
else:
    print("Image is entirely transparent or couldn't find bounding box.")

from flask import Flask, make_response, request, jsonify, send_file
from flask_cors import CORS
import shutil
import os 
import os.path as osp 
import cv2 
import numpy as np
import pickle
import sys
sys.path.append("../..")
from utils import *

# some GLOBAL variables 
"""CHANGE THIS TO MANTHANA"""
# DATASETS_DIR = "/data3/vaibhav/SegmentAnyLine/datasets"
DATASETS_DIR = "../../datasets/"
CLIENT_IMAGES = "../client/public/images"
ANNOTATION_TYPES = ["polygons", "scribbles"]

current_img_data = None

datasets_list = os.listdir(DATASETS_DIR)


# Create a Flask application
app = Flask(__name__)
CORS(app)

# Define a route and a corresponding view function
"""
this route will make sure that the correct thumbnails (named according to the dataset) are present in the CLIENT_IMAGES/thumbnails directory
"""
@app.route('/')
def collections():
    global datasets_list 
    ctgs_list = os.listdir(DATASETS_DIR)

    if not osp.exists(osp.join(CLIENT_IMAGES, "thumbnails")):
        os.mkdir(osp.join(CLIENT_IMAGES, "thumbnails"))
    
    categories = []

    # check whether reference images exist for each of the datasets, if not, then create one in the correct directory
    thumbnails = os.listdir(osp.join(CLIENT_IMAGES, "thumbnails"))
    for ctg in ctgs_list: 
        categories.append({"title": ctg, "collections": []})
        datasets_list = os.listdir(osp.join(DATASETS_DIR, ctg))
        for dataset in datasets_list:
            categories[-1]["collections"].append({"title": dataset, "thumbnail": f"/images/thumbnails/{dataset}.jpg"})
            found = False
            for thumbnail in thumbnails:
                if thumbnail.split(".")[0] == dataset:
                    # the thumbnail for this dataset is present
                    found = True
                    break
            if found:
                continue

            # pick a random image for thumbnail
            dataset_images = os.listdir(osp.join(DATASETS_DIR, ctg, dataset, "train"))
            dataset_images = [filename for filename in dataset_images if filename.find(".pkl") == -1]
            random_img_path = osp.join(DATASETS_DIR, ctg, dataset, "train", dataset_images[np.random.randint(len(dataset_images))])
            file_extension = random_img_path.split("/")[-1].split(".")[-1]
            shutil.copy(random_img_path, osp.join(CLIENT_IMAGES, "thumbnails", f"{dataset}.{file_extension}"))

    response = jsonify({"categories": categories})
    return response, 200
    # return 'Hello, World!'

"""
returns:
* the list of available annotations
"""
@app.route("/fetch_annotation", methods=["GET"])
def fetch_img_data():
    if not osp.exists(osp.join(CLIENT_IMAGES, "current")):
        os.mkdir(osp.join(CLIENT_IMAGES, "current"))

    # Check if the "collectionName" header exists in the request
    if 'ctgName' not in request.headers:
        return 'Error: "ctgName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'collectionName' not in request.headers:
        return 'Error: "collectionName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'imgIdx' not in request.headers:
        return 'Error: "imgIdx" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'split' not in request.headers:
        return 'Error: "split" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'annotation' not in request.headers:
        return 'Error: "annotation" header not found', 400  # Return a 400 Bad Request status if the header is missing

    ctg_name = request.headers['ctgName']
    collection_name = request.headers['collectionName']
    annotation_name = request.headers['annotation']
    assert annotation_name in ANNOTATION_TYPES
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    split = request.headers['split']
    
    imgs_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split))
    img_name = [img_path for img_path in imgs_list if img_path.find(img_name) != -1][0]
    img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name)
    print(f"img_path: {img_path}")
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!'

    plain_img = cv2.imread(img_path)
    assert plain_img is not None 

    with open(osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name.split(".")[0] + ".pkl"), "rb") as f:
        img_data = pickle.load(f) 

    assert img_data is not None

    annotation_data = img_data[annotation_name]
    if annotation_name == "polygons":
        polygon_img = plain_img.copy()
        polygons = annotation_data
        # print(type(polygons))
        # print(polygons[0].dtype)
        # print(polygons[0].shape)
        cv2.polylines(polygon_img, polygons, True, (255, 0, 0), 2) 
        cv2.imwrite(f"annotation.jpg", polygon_img)
        # shutil.copy("polygons.jpg", osp.join(CLIENT_IMAGES, "current", "polygons.jpg"))
    elif annotation_name == "scribbles":
        scribble_img = plain_img.copy()
        scribbles = annotation_data
        cv2.polylines(scribble_img, scribbles, False, (255, 0, 0), 2)
        cv2.imwrite(f"annotation.jpg", scribble_img)
        # shutil.copy("scribbles.jpg", osp.join(CLIENT_IMAGES, "current", "scribbles.jpg"))
    
    return send_file("annotation.jpg", mimetype="image/jpeg")

    


# Run the application
if __name__ == '__main__':
    app.run(debug=True)

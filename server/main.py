from flask import Flask, make_response, request, jsonify, send_file
import PIL
from PIL import Image
import random
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

            # pick a random image for thumbnail
            splits = os.listdir(osp.join(DATASETS_DIR, ctg, dataset))
            split = random.choice(splits)
            dataset_images = os.listdir(osp.join(DATASETS_DIR, ctg, dataset, split))
            dataset_images = [filename for filename in dataset_images if filename.find(".pkl") == -1]
            random_img_path = osp.join(DATASETS_DIR, ctg, dataset, split, dataset_images[np.random.randint(len(dataset_images))])
            file_extension = random_img_path.split("/")[-1].split(".")[-1]
            categories[-1]["collections"].append({"title": dataset, "thumbnail": f"/images/thumbnails/{dataset}.jpg"})

            # see whether the thumbnail image needs to be copied to the right location
            found = False
            for thumbnail in thumbnails:
                if thumbnail.split(".")[0] == dataset:
                    # the thumbnail for this dataset is present
                    found = True
                    break
            if found:
                continue

            if file_extension == "png":
                # img_png = Image.open(random_img_path)
                # img_png.save(osp.join(CLIENT_IMAGES, "thumbnails", f"{dataset}.jpg"))
                img_png = cv2.imread(random_img_path)
                cv2.imwrite(osp.join(CLIENT_IMAGES, "thumbnails", f"{dataset}.jpg"), img_png)
            else:
                shutil.copy(random_img_path, osp.join(CLIENT_IMAGES, "thumbnails", f"{dataset}.{file_extension}"))

    # print(categories)
    response = jsonify({"categories": categories})
    return response, 200
    # return 'Hello, World!'

"""
returns:
* the list of available annotations
"""
@app.route("/fetch_annotation", methods=["GET"])
def fetch_annotation():
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
    annotations = request.headers['annotation']
    split = request.headers['split']
    # print(f"the index requested was {request.headers["imgIdx"]}")
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split)):
       return send_file("notfound.jpg", mimetype="image/jpeg") 
    imgs_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split))
    imgs_list = [img_name for img_name in imgs_list if img_name.find(".pkl") == -1]
    # equal number of pickle files and images
    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = [img_path for img_path in imgs_list if img_path.find(img_name) != -1][0]
    img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name)
    # print(f"img_path: {img_path}")
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!'

    plain_img = cv2.imread(img_path)
    assert plain_img is not None 

    with open(osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name.split(".")[0] + ".pkl"), "rb") as f:
        img_data = pickle.load(f) 

    assert img_data is not None

    if "polygons" in annotations:
        # polygon_img = plain_img.copy()
        polygons = img_data["annotations"]["polygons"]
        # print(type(polygons))
        # print(polygons[0].dtype)
        # print(polygons[0].shape)
        cv2.polylines(plain_img, polygons, True, (255, 0, 0), 3) 
        # cv2.imwrite(f"annotation.jpg", polygon_img)
        # shutil.copy("polygons.jpg", osp.join(CLIENT_IMAGES, "current", "polygons.jpg"))
    if "scribbles" in annotations:
        scribbles = img_data["annotations"]["scribbles"]
        cv2.polylines(plain_img, scribbles, False, (255, 0, 0), 2)

    cv2.imwrite(f"annotation.jpg", plain_img)
    # shutil.copy("scribbles.jpg", osp.join(CLIENT_IMAGES, "current", "scribbles.jpg"))
    return send_file("annotation.jpg", mimetype="image/jpeg")


@app.route("/fetch_collection_metadata", methods=["GET"])
def fetch_collection_metadata():
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

    # ctg_name = request.headers['ctgName']
    # collection_name = request.headers['collectionName']
    # img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    # split = request.headers['split']
    
    # imgs_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split))
    # img_name = [img_path for img_path in imgs_list if img_path.find(img_name) != -1][0]
    # img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name)
    # print(f"img_path: {img_path}")
    # if not osp.exists(img_path):
    #     return 'Error: the given image does not exist!'

    ctg_name = request.headers['ctgName']
    collection_name = request.headers['collectionName']
    split = request.headers['split']
    # print(f"the index requested was {request.headers["imgIdx"]}")
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split)):
        res_json = {
            "splitNotFound": True
        }
        return jsonify(res_json), 200
    imgs_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split))
    imgs_list = [img_name for img_name in imgs_list if img_name.find(".pkl") == -1]
    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = [img_path for img_path in imgs_list if img_path.find(img_name) != -1][0]
    img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name)
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!'

    plain_img = cv2.imread(img_path)
    assert plain_img is not None 

    with open(osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name.split(".")[0] + ".pkl"), "rb") as f:
        img_data = pickle.load(f) 

    assert img_data is not None

    annotation_names = list(img_data["annotations"].keys()) 
    res_json = {
        "annotation_names": annotation_names,
        "num_images": num_images
    }

    return jsonify(res_json), 200


# Run the application
if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, make_response, request, jsonify, send_file, g
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
MAX_PIXELS = 2e6
sys.path.append("../..")
from utils import *
import pickle

colors = None

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


# Before each request, initialize g.my_variable with the value of MY_GLOBAL_VARIABLE
@app.before_request
def before_request():
    g.colors = app.config.get("COLORS")

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

            img = cv2.imread(random_img_path)
            n_pixels = img.shape[0] * img.shape[1]
            if n_pixels > MAX_PIXELS:
                scale_factor = MAX_PIXELS / n_pixels
                new_size = (int(img.shape[1] * scale_factor), int(img.shape[0] * scale_factor))
                img = cv2.resize(img, new_size)
            cv2.imwrite(osp.join(CLIENT_IMAGES, "thumbnails", f"{dataset}.jpg"), img)

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
    if 'highres' not in request.headers:
        return 'Error: "highres" header not found', 400  # Return a 400 Bad Request status if the header is missing


    ctg_name = request.headers['ctgName']
    collection_name = request.headers['collectionName']
    annotations = request.headers['annotation']
    split = request.headers['split']
    highres = request.headers['highres']
    if highres == "false":
        highres = False
    else:
        highres = True
    # print(f"the index requested was {request.headers["imgIdx"]}")
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split)):
       return send_file("notfound.jpg", mimetype="image/jpeg") 

    imgs_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split))
    imgs_list = [osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name) for img_name in imgs_list]
    # if reannotate and remove folders do not exist, then create them
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))

    remove_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    remove_list = [osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove", img_name) for img_name in remove_list]
    reannotate_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))
    reannotate_list = [osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate", img_name) for img_name in reannotate_list]
    imgs_list = imgs_list + reannotate_list + remove_list

    imgs_list = sorted([img_path for img_path in imgs_list if img_path.find(".jpg") != -1])
    remove_list = sorted([img_path for img_path in remove_list if img_path.find(".jpg") != -1])
    reannotate_list = sorted([img_path for img_path in reannotate_list if img_path.find(".jpg") != -1])
    # equal number of pickle files and images
    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = img_name + ".jpg"
    img_path = [img_path for img_path in imgs_list if img_path.find(img_name) != -1]
    assert len(img_path) == 1
    img_path = img_path[0]
    # print(f"img_path: {img_path}")
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!'

    plain_img = cv2.imread(img_path)
    assert plain_img is not None 

    pkl_path = img_path.replace(".jpg", ".pkl")
    with open(pkl_path, "rb") as f:
        img_data = pickle.load(f) 

    assert img_data is not None

    annotations = annotations.strip()
    annotations = annotations.split(",")
    annotations = [annotation for annotation in annotations if len(annotation) > 0]
    if "polygons" in annotations:
        # polygon_img = plain_img.copy()
        polygons = img_data["annotations"]["polygons"]
        # print(type(polygons))
        # print(polygons[0].dtype)
        # print(polygons[0].shape)
        for polygon_idx, polygon in enumerate(polygons):
            color = g.colors[polygon_idx % len(g.colors)]
            color = np.array(color).astype(np.int32)
            color = color.tolist()
            # print(f"color: {color}")
            cv2.polylines(plain_img, [polygon], True, color, 3) 
        # cv2.imwrite(f"annotation.jpg", polygon_img)
        # shutil.copy("polygons.jpg", osp.join(CLIENT_IMAGES, "current", "polygons.jpg"))
    for annotation in annotations:
        if annotation == "polygons":
            # we have already dealt with polygons above
            continue
        scribbles = img_data["annotations"][annotation]
        for scribble_idx, scribble in enumerate(scribbles):
            color = g.colors[scribble_idx % len(g.colors)]
            color = np.array(color).astype(np.int32)
            color = color.tolist()
            # plain_img[scribble[:, 1], scribble[:, 0]] = color
            for pt in scribble:
                cv2.circle(plain_img, pt, 3, color, 3)
            # cv2.polylines(plain_img, [scribble], False, color, 3)
        # cv2.polylines(plain_img, scribbles, False, (255, 0, 0), 2)

    n_pixels = plain_img.shape[0] * plain_img.shape[1]
    if n_pixels > MAX_PIXELS:
        scale_factor = MAX_PIXELS / n_pixels
        new_size = (int(plain_img.shape[1] * scale_factor), int(plain_img.shape[0] * scale_factor))
        if not highres:
            plain_img = cv2.resize(plain_img, new_size)

    cv2.imwrite(f"annotation.jpg", plain_img)
    # shutil.copy("scribbles.jpg", osp.join(CLIENT_IMAGES, "current", "scribbles.jpg"))
    return send_file("annotation.jpg", mimetype="image/jpeg")


@app.route("/fetch_metadata", methods=["GET"])
def fetch_metadata():
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
    imgs_list = [osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name) for img_name in imgs_list]
    # if reannotate and remove folders do not exist, then create them
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))

    remove_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    remove_list = [osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove", img_name) for img_name in remove_list]
    reannotate_list = os.listdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))
    reannotate_list = [osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate", img_name) for img_name in reannotate_list]
    imgs_list = imgs_list + reannotate_list + remove_list

    imgs_list = sorted([img_path for img_path in imgs_list if img_path.find(".jpg") != -1])
    remove_list = sorted([img_path for img_path in remove_list if img_path.find(".jpg") != -1])
    reannotate_list = sorted([img_path for img_path in reannotate_list if img_path.find(".jpg") != -1])
    # equal number of pickle files and images
    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = img_name + ".jpg"
    reannotate = False
    remove = False 
    reannotate_search = [img_path for img_path in reannotate_list if img_path.find(img_name) != -1]
    remove_search = [img_path for img_path in remove_list if img_path.find(img_name) != -1]
    assert len(reannotate_search) <= 1 and len(remove_search) <= 1
    if len(reannotate_search) == 1:
        reannotate = True 
    if len(remove_search) == 1:
        remove = True
    img_path = [img_path for img_path in imgs_list if img_path.find(img_name) != -1]
    assert len(img_path) == 1
    img_path = img_path[0]
    # print(f"img_path: {img_path}")
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!', 404

    pkl_path = img_path.replace(".jpg", ".pkl")
    if not osp.exists(pkl_path):
        return 'Error: the given image does not exist!', 404
    with open(pkl_path, "rb") as f:
        img_data = pickle.load(f) 

    assert img_data is not None

    annotation_names = list(img_data["annotations"].keys()) 
    res_json = {
        "annotation_names": annotation_names,
        "reannotate": reannotate,
        "remove": remove,
        "num_images": num_images
    }

    return jsonify(res_json), 200


@app.route("/send_to_reannotate", methods=["GET"])
def send_to_reannotate():

    # Check if the "collectionName" header exists in the request
    if 'ctgName' not in request.headers:
        return 'Error: "ctgName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'collectionName' not in request.headers:
        return 'Error: "collectionName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'imgIdx' not in request.headers:
        return 'Error: "imgIdx" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'split' not in request.headers:
        return 'Error: "split" header not found', 400  # Return a 400 Bad Request status if the header is missing

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

    # if reannotate and remove folders do not exist, then create them
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))

    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = img_name + ".jpg" 
    img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name)
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!', 404
    pkl_name = img_name.replace(".jpg", ".pkl")
    pkl_path = img_path.replace(".jpg", ".pkl")
    if not osp.exists(pkl_path):
        return 'Error: the given pkl file does not exist!', 404
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate", img_name))
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, pkl_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate", pkl_name))

    res_json = {
        "success": True,
    }

    return jsonify(res_json), 200


@app.route("/remove_from_reannotate", methods=["GET"])
def remove_from_reannotate():

    # Check if the "collectionName" header exists in the request
    if 'ctgName' not in request.headers:
        return 'Error: "ctgName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'collectionName' not in request.headers:
        return 'Error: "collectionName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'imgIdx' not in request.headers:
        return 'Error: "imgIdx" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'split' not in request.headers:
        return 'Error: "split" header not found', 400  # Return a 400 Bad Request status if the header is missing

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

    # if reannotate and remove folders do not exist, then create them
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))

    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = img_name + ".jpg" 
    img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate", img_name)
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!', 404
    pkl_name = img_name.replace(".jpg", ".pkl")
    pkl_path = img_path.replace(".jpg", ".pkl")
    if not osp.exists(pkl_path):
        return 'Error: the given pkl file does not exist!', 404
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate", img_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name))
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate", pkl_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, pkl_name))

    res_json = {
        "success": True,
    }

    return jsonify(res_json), 200


@app.route("/send_to_remove", methods=["GET"])
def send_to_remove():

    # Check if the "collectionName" header exists in the request
    if 'ctgName' not in request.headers:
        return 'Error: "ctgName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'collectionName' not in request.headers:
        return 'Error: "collectionName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'imgIdx' not in request.headers:
        return 'Error: "imgIdx" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'split' not in request.headers:
        return 'Error: "split" header not found', 400  # Return a 400 Bad Request status if the header is missing

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

    # if reannotate and remove folders do not exist, then create them
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))

    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = img_name + ".jpg" 
    img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name)
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!', 404
    pkl_name = img_name.replace(".jpg", ".pkl")
    pkl_path = img_path.replace(".jpg", ".pkl")
    if not osp.exists(pkl_path):
        return 'Error: the given pkl file does not exist!', 404
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove", img_name))
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, pkl_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove", pkl_name))

    res_json = {
        "success": True,
    }

    return jsonify(res_json), 200


@app.route("/remove_from_remove", methods=["GET"])
def remove_from_remove():

    # Check if the "collectionName" header exists in the request
    if 'ctgName' not in request.headers:
        return 'Error: "ctgName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'collectionName' not in request.headers:
        return 'Error: "collectionName" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'imgIdx' not in request.headers:
        return 'Error: "imgIdx" header not found', 400  # Return a 400 Bad Request status if the header is missing
    if 'split' not in request.headers:
        return 'Error: "split" header not found', 400  # Return a 400 Bad Request status if the header is missing

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

    # if reannotate and remove folders do not exist, then create them
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove"))
    if not osp.exists(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate")):
        os.mkdir(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "reannotate"))

    num_images = len(imgs_list)
    img_name = get_file_name_by_idx(int(request.headers['imgIdx']))
    img_name = img_name + ".jpg" 
    img_path = osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove", img_name)
    if not osp.exists(img_path):
        return 'Error: the given image does not exist!', 404
    pkl_name = img_name.replace(".jpg", ".pkl")
    pkl_path = img_path.replace(".jpg", ".pkl")
    if not osp.exists(pkl_path):
        return 'Error: the given pkl file does not exist!', 404
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove", img_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, img_name))
    shutil.move(osp.join(DATASETS_DIR, ctg_name, collection_name, split, "remove", pkl_name), osp.join(DATASETS_DIR, ctg_name, collection_name, split, pkl_name))

    res_json = {
        "success": True,
    }

    return jsonify(res_json), 200



# Run the application
if __name__ == '__main__':
    with open(f"colors.pkl", "rb") as f:
        colors = pickle.load(f)
    app.config["COLORS"] = colors
    app.run(host="10.4.16.102", port=1510, debug=True)

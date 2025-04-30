import torch
import torch.nn as nn
from torchvision import models, transforms
from torch.utils.checkpoint import checkpoint_sequential
from PIL import Image
import sys

# Set device (GPU if available, else CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Define the Checkpointed ResNet-152 model
class CheckpointedResNet152(nn.Module):
    def __init__(self, num_classes=101):
        super(CheckpointedResNet152, self).__init__()
        base_model = models.resnet152(weights="IMAGENET1K_V1")

        self.conv1 = base_model.conv1
        self.bn1 = base_model.bn1
        self.relu = base_model.relu
        self.maxpool = base_model.maxpool

        self.layer1 = base_model.layer1
        self.layer2 = base_model.layer2
        self.layer3 = base_model.layer3
        self.layer4 = base_model.layer4

        self.avgpool = base_model.avgpool
        self.fc = nn.Linear(base_model.fc.in_features, num_classes)

    def forward(self, x):
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = checkpoint_sequential(self.layer1, segments=1, input=x)
        x = checkpoint_sequential(self.layer2, segments=1, input=x)
        x = checkpoint_sequential(self.layer3, segments=1, input=x)
        x = checkpoint_sequential(self.layer4, segments=1, input=x)

        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.fc(x)
        return x

def predict_food(image_path):
    # Initialize and load the model
    model = CheckpointedResNet152(num_classes=101).to(device)
    model = nn.DataParallel(model)

    # Load model weights
    model.load_state_dict(torch.load("resnet152_food101_best.pt", map_location=device))
    model.eval()

    # Define image preprocessing
    transform_test = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Load and preprocess the input image
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform_test(image).unsqueeze(0).to(device)

    # Perform prediction
    with torch.no_grad():
        outputs = model(input_tensor)
        _, predicted = torch.max(outputs, 1)
    
    class_name_mapping = {
        0: "apple_pie", 1: "baby_back_ribs", 2: "baklava", 3: "beef_carpaccio", 4: "beef_tartare",
        5: "beet_salad", 6: "beignets", 7: "bibimbap", 8: "bread_pudding", 9: "breakfast_burrito",
        10: "bruschetta", 11: "caesar_salad", 12: "cannoli", 13: "caprese_salad", 14: "carrot_cake",
        15: "ceviche", 16: "cheese_plate", 17: "cheesecake", 18: "chicken_curry", 19: "chicken_quesadilla",
        20: "chicken_wings", 21: "chocolate_cake", 22: "chocolate_mousse", 23: "churros", 24: "clam_chowder",
        25: "club_sandwich", 26: "crab_cakes", 27: "creme_brulee", 28: "croque_madame", 29: "cup_cakes",
        30: "deviled_eggs", 31: "donuts", 32: "dumplings", 33: "edamame", 34: "eggs_benedict",
        35: "escargots", 36: "falafel", 37: "filet_mignon", 38: "fish_and_chips", 39: "foie_gras",
        40: "french_fries", 41: "french_onion_soup", 42: "french_toast", 43: "fried_calamari", 44: "fried_rice",
        45: "frozen_yogurt", 46: "garlic_bread", 47: "gnocchi", 48: "greek_salad", 49: "grilled_cheese_sandwich",
        50: "grilled_salmon", 51: "guacamole", 52: "gyoza", 53: "hamburger", 54: "hot_and_sour_soup",
        55: "hot_dog", 56: "huevos_rancheros", 57: "hummus", 58: "ice_cream", 59: "lasagna",
        60: "lobster_bisque", 61: "lobster_roll_sandwich", 62: "macaroni_and_cheese", 63: "macarons", 64: "miso_soup",
        65: "mussels", 66: "nachos", 67: "omelette", 68: "onion_rings", 69: "oysters",
        70: "pad_thai", 71: "paella", 72: "pancakes", 73: "panna_cotta", 74: "peking_duck",
        75: "pho", 76: "pizza", 77: "pork_chop", 78: "poutine", 79: "prime_rib",
        80: "pulled_pork_sandwich", 81: "ramen", 82: "ravioli", 83: "red_velvet_cake", 84: "risotto",
        85: "samosa", 86: "sashimi", 87: "scallops", 88: "seaweed_salad", 89: "shrimp_and_grits",
        90: "spaghetti_bolognese", 91: "spaghetti_carbonara", 92: "spring_rolls", 93: "steak", 94: "strawberry_shortcake",
        95: "sushi", 96: "tacos", 97: "takoyaki", 98: "tiramisu", 99: "tuna_tartare", 100: "waffles"
    }

    food_name = class_name_mapping.get(predicted.item(), 'Unknown Class')
    return food_name

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    food_name = predict_food(image_path)
    print(food_name)

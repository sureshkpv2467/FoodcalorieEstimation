import torch
import torchvision.models as models

# Define the same model architecture
model = models.resnet152(pretrained=False)  # Ensure the architecture matches

# Load the saved weights
model.load_state_dict(torch.load("resnet152_food101_best.pt", map_location=torch.device('cpu')))

# Set the model to evaluation mode
model.eval()

# Print model summary
print(model)

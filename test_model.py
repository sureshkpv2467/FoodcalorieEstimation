import sys
from Backend.run import predict_food

def test_model(image_path):
    try:
        food_name = predict_food(image_path)
        print(f"✅ Test successful!")
        print(f"Image: {image_path}")
        print(f"Detected food: {food_name.replace('_', ' ').upper()}")
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_model.py <image_path>")
        sys.exit(1)
    
    test_model(sys.argv[1]) 
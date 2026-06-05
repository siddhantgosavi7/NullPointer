from api.classifier import predict_disease


if __name__ == "__main__":
    sample_image = "sample_crop.jpg"
    disease, score = predict_disease(sample_image)
    print(f"Predicted disease: {disease}")
    print(f"Confidence: {score:.2f}%")

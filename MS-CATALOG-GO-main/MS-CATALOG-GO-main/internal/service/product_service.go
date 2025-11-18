package service

import (
	"fmt"

	"ms-catalog-go/internal/models"
	"ms-catalog-go/internal/repository"

	"github.com/google/uuid"
)

type ProductService interface {
	// Category operations
	CreateCategory(req *models.CreateCategoryRequest) (*models.Category, error)
	GetCategories() ([]models.Category, error)
	GetCategory(id string) (*models.Category, error)
	UpdateCategory(id string, req *models.UpdateCategoryRequest) (*models.Category, error)
	DeleteCategory(id string) error

	// Product operations
	CreateProduct(req *models.CreateProductRequest) (*models.Product, error)
	GetProducts(categoryID string) ([]models.Product, error)
	GetProduct(id string) (*models.Product, error)
	UpdateProduct(id string, req *models.UpdateProductRequest) (*models.Product, error)
	DeleteProduct(id string) error
}

type productService struct {
	repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{
		repo: repo,
	}
}

func (s *productService) CreateCategory(req *models.CreateCategoryRequest) (*models.Category, error) {
	category := &models.Category{
		ID:   generateUUID(),
		Name: req.Name,
	}

	err := s.repo.CreateCategory(category)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	return category, nil
}

func (s *productService) GetCategories() ([]models.Category, error) {
	return s.repo.GetCategories()
}

func (s *productService) GetCategory(id string) (*models.Category, error) {
	return s.repo.GetCategory(id)
}

func (s *productService) UpdateCategory(id string, req *models.UpdateCategoryRequest) (*models.Category, error) {
	category := &models.Category{
		Name: req.Name,
	}

	err := s.repo.UpdateCategory(id, category)
	if err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	updatedCategory, err := s.repo.GetCategory(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated category: %w", err)
	}

	return updatedCategory, nil
}

func (s *productService) DeleteCategory(id string) error {
	err := s.repo.DeleteCategory(id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}

func (s *productService) CreateProduct(req *models.CreateProductRequest) (*models.Product, error) {
	product := &models.Product{
		ID:         generateUUID(),
		CategoryID: req.CategoryID,
		Code:       req.Code,
		Name:       req.Name,
		PriceCents: req.PriceCents,
		IsActive:   true,
	}

	err := s.repo.CreateProduct(product)
	if err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	return product, nil
}

func (s *productService) GetProducts(categoryID string) ([]models.Product, error) {
	return s.repo.GetProducts(categoryID)
}

func (s *productService) GetProduct(id string) (*models.Product, error) {
	return s.repo.GetProduct(id)
}

func (s *productService) UpdateProduct(id string, req *models.UpdateProductRequest) (*models.Product, error) {
	product := &models.Product{
		CategoryID: req.CategoryID,
		Name:       req.Name,
		PriceCents: req.PriceCents,
		IsActive:   req.IsActive,
	}

	err := s.repo.UpdateProduct(id, product)
	if err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}

	updatedProduct, err := s.repo.GetProduct(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated product: %w", err)
	}

	return updatedProduct, nil
}

func (s *productService) DeleteProduct(id string) error {
	err := s.repo.DeleteProduct(id)
	if err != nil {
		return fmt.Errorf("failed to delete product: %w", err)
	}

	return nil
}

// Generar UUID v4
func generateUUID() string {
	return uuid.New().String()
}

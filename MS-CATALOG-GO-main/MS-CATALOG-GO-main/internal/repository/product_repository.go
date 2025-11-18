package repository

import (
	"database/sql"
	"fmt"

	"ms-catalog-go/internal/models"

	_ "github.com/lib/pq"
)

type ProductRepository interface {
	// Category operations
	CreateCategory(category *models.Category) error
	GetCategories() ([]models.Category, error)
	GetCategory(id string) (*models.Category, error)
	UpdateCategory(id string, category *models.Category) error
	DeleteCategory(id string) error

	// Product operations
	CreateProduct(product *models.Product) error
	GetProducts(categoryID string) ([]models.Product, error)
	GetProduct(id string) (*models.Product, error)
	UpdateProduct(id string, product *models.Product) error
	DeleteProduct(id string) error
}

type productRepository struct {
	db *sql.DB
}

func NewProductRepository(dbURL string) (ProductRepository, error) {
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &productRepository{db: db}, nil
}

// ================================================
// Category operations
// ================================================

func (r *productRepository) CreateCategory(category *models.Category) error {
	query := `
		INSERT INTO bar_system.categories (id, name, is_active)
		VALUES ($1, $2, true)
		ON CONFLICT (name) DO NOTHING
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, category.ID, category.Name).
		Scan(&category.CreatedAt, &category.UpdatedAt)

	return err
}

func (r *productRepository) GetCategories() ([]models.Category, error) {
	query := `
		SELECT id, name, created_at, updated_at
		FROM bar_system.categories
		WHERE is_active = true
		ORDER BY name
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Inicializar slice vacío para asegurar que siempre devolvemos un array
	categories := make([]models.Category, 0)
	for rows.Next() {
		var category models.Category
		err := rows.Scan(
			&category.ID, &category.Name,
			&category.CreatedAt, &category.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	// Verificar errores de iteración
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return categories, nil
}

func (r *productRepository) GetCategory(id string) (*models.Category, error) {
	query := `
		SELECT id, name, created_at, updated_at
		FROM bar_system.categories
		WHERE id = $1 AND is_active = true
	`

	category := &models.Category{}
	err := r.db.QueryRow(query, id).Scan(
		&category.ID, &category.Name,
		&category.CreatedAt, &category.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return category, nil
}

func (r *productRepository) UpdateCategory(id string, category *models.Category) error {
	query := `
		UPDATE bar_system.categories 
		SET name = $1
		WHERE id = $2 AND is_active = true
	`

	_, err := r.db.Exec(query, category.Name, id)
	return err
}

func (r *productRepository) DeleteCategory(id string) error {
	query := `
		UPDATE bar_system.categories 
		SET is_active = false
		WHERE id = $1
	`

	_, err := r.db.Exec(query, id)
	return err
}

// ================================================
// Product operations
// ================================================

func (r *productRepository) CreateProduct(product *models.Product) error {
	query := `
		INSERT INTO bar_system.products (id, category_id, code, name, price_cents, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (code) DO NOTHING
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(query, product.ID, product.CategoryID, product.Code, product.Name, product.PriceCents, product.IsActive).
		Scan(&product.CreatedAt, &product.UpdatedAt)

	return err
}

func (r *productRepository) GetProducts(categoryID string) ([]models.Product, error) {
	var query string
	var args []interface{}

	if categoryID != "" {
		query = `
			SELECT p.id, p.category_id, p.code, p.name, p.price_cents, p.is_active, 
			       p.created_at, p.updated_at, c.id as cat_id, c.name as cat_name
			FROM bar_system.products p
			LEFT JOIN bar_system.categories c ON p.category_id = c.id
			WHERE p.category_id = $1 AND p.is_active = true
			ORDER BY p.name
		`
		args = []interface{}{categoryID}
	} else {
		query = `
			SELECT p.id, p.category_id, p.code, p.name, p.price_cents, p.is_active,
			       p.created_at, p.updated_at, c.id as cat_id, c.name as cat_name
			FROM bar_system.products p
			LEFT JOIN bar_system.categories c ON p.category_id = c.id
			WHERE p.is_active = true
			ORDER BY p.name
		`
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Inicializar slice vacío para asegurar que siempre devolvemos un array
	products := make([]models.Product, 0)
	for rows.Next() {
		var product models.Product
		var catID, catName sql.NullString

		err := rows.Scan(
			&product.ID, &product.CategoryID, &product.Code, &product.Name,
			&product.PriceCents, &product.IsActive,
			&product.CreatedAt, &product.UpdatedAt,
			&catID, &catName,
		)
		if err != nil {
			return nil, err
		}

		// Asignar categoría si existe
		if catID.Valid && catName.Valid {
			product.Category = &models.Category{
				ID:   catID.String,
				Name: catName.String,
			}
		}

		products = append(products, product)
	}

	// Verificar errores de iteración
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

func (r *productRepository) GetProduct(id string) (*models.Product, error) {
	query := `
		SELECT p.id, p.category_id, p.code, p.name, p.price_cents, p.is_active,
		       p.created_at, p.updated_at, c.id as cat_id, c.name as cat_name
		FROM bar_system.products p
		LEFT JOIN bar_system.categories c ON p.category_id = c.id
		WHERE p.id = $1 AND p.is_active = true
	`

	product := &models.Product{}
	var catID, catName sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&product.ID, &product.CategoryID, &product.Code, &product.Name,
		&product.PriceCents, &product.IsActive,
		&product.CreatedAt, &product.UpdatedAt,
		&catID, &catName,
	)

	if err != nil {
		return nil, err
	}

	// Asignar categoría si existe
	if catID.Valid && catName.Valid {
		product.Category = &models.Category{
			ID:   catID.String,
			Name: catName.String,
		}
	}

	return product, nil
}

func (r *productRepository) UpdateProduct(id string, product *models.Product) error {
	query := `
		UPDATE bar_system.products 
		SET category_id = $1, name = $2, price_cents = $3, is_active = $4
		WHERE id = $5 AND is_active = true
	`

	_, err := r.db.Exec(query, product.CategoryID, product.Name, product.PriceCents, product.IsActive, id)
	return err
}

func (r *productRepository) DeleteProduct(id string) error {
	query := `
		UPDATE bar_system.products 
		SET is_active = false
		WHERE id = $1
	`

	_, err := r.db.Exec(query, id)
	return err
}

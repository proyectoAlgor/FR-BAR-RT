package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"ms-reports-go/internal/models"

	_ "github.com/lib/pq"
)

type ReportRepository interface {
	// User reports
	GetTotalUsers() (int, error)
	GetActiveUsers() (int, error)
	GetUsersByRole() ([]models.RoleCount, error)
	GetUsersByLocation() ([]models.LocationUserCount, error)
	GetRecentLogins(days int) (int, error)
	GetFailedLogins(days int) (int, error)

	// Product reports
	GetTotalProducts() (int, error)
	GetActiveProducts() (int, error)
	GetProductsByCategory() ([]models.CategoryProductCount, error)
	GetAveragePrice() (float64, error)
	GetPriceRange() (models.PriceRange, error)

	// Venue reports
	GetTotalLocations() (int, error)
	GetActiveLocations() (int, error)
	GetTotalTables() (int, error)
	GetTablesByStatus() ([]models.TableStatusCount, error)
	GetLocationDetails() ([]models.LocationDetail, error)
	GetVenueDetails(locationID string) (*models.VenueSpecificReport, error)
	GetVenueUsers(locationID string) ([]models.VenueUserInfo, error)

	// Activity reports
	GetTotalLoginAttempts(days int) (int, error)
	GetSuccessfulLogins(days int) (int, error)
	GetLoginAttemptsByDay(days int) ([]models.DailyLoginCount, error)
	GetRecentFailedLogins(limit int) ([]models.FailedLoginDetail, error)
	GetPasswordResets(days int) (int, error)
	GetPasswordResetsByDay(days int) ([]models.DailyPasswordReset, error)
}

type reportRepository struct {
	db *sql.DB
}

func NewReportRepository(dbURL string) (ReportRepository, error) {
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &reportRepository{db: db}, nil
}

// User reports
func (r *reportRepository) GetTotalUsers() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bar_system.users").Scan(&count)
	return count, err
}

func (r *reportRepository) GetActiveUsers() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bar_system.users WHERE is_active = true").Scan(&count)
	return count, err
}

func (r *reportRepository) GetUsersByRole() ([]models.RoleCount, error) {
	query := `
		SELECT r.code, r.name, COUNT(ur.user_id) as count
		FROM bar_system.roles r
		LEFT JOIN bar_system.user_roles ur ON r.id = ur.role_id
		WHERE r.is_active = true
		GROUP BY r.id, r.code, r.name
		ORDER BY count DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.RoleCount
	for rows.Next() {
		var rc models.RoleCount
		if err := rows.Scan(&rc.RoleCode, &rc.RoleName, &rc.Count); err != nil {
			return nil, err
		}
		results = append(results, rc)
	}

	return results, rows.Err()
}

func (r *reportRepository) GetUsersByLocation() ([]models.LocationUserCount, error) {
	query := `
		SELECT 
			COALESCE(l.id::text, 'unassigned') as location_id,
			COALESCE(l.name, 'Sin asignar') as location_name,
			COUNT(u.id) as count
		FROM bar_system.users u
		LEFT JOIN bar_system.locations l ON u.venue_id = l.id
		GROUP BY l.id, l.name
		ORDER BY count DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.LocationUserCount
	for rows.Next() {
		var luc models.LocationUserCount
		if err := rows.Scan(&luc.LocationID, &luc.LocationName, &luc.Count); err != nil {
			return nil, err
		}
		results = append(results, luc)
	}

	return results, rows.Err()
}

func (r *reportRepository) GetRecentLogins(days int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM bar_system.login_attempts 
		WHERE success = true 
		AND attempted_at >= NOW() - INTERVAL '%d days'
	`
	err := r.db.QueryRow(fmt.Sprintf(query, days)).Scan(&count)
	return count, err
}

func (r *reportRepository) GetFailedLogins(days int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM bar_system.login_attempts 
		WHERE success = false 
		AND attempted_at >= NOW() - INTERVAL '%d days'
	`
	err := r.db.QueryRow(fmt.Sprintf(query, days)).Scan(&count)
	return count, err
}

// Product reports
func (r *reportRepository) GetTotalProducts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bar_system.products").Scan(&count)
	return count, err
}

func (r *reportRepository) GetActiveProducts() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bar_system.products WHERE is_active = true").Scan(&count)
	return count, err
}

func (r *reportRepository) GetProductsByCategory() ([]models.CategoryProductCount, error) {
	query := `
		SELECT c.id::text, c.name, COUNT(p.id) as count
		FROM bar_system.categories c
		LEFT JOIN bar_system.products p ON c.id = p.category_id
		WHERE c.is_active = true
		GROUP BY c.id, c.name
		ORDER BY count DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.CategoryProductCount
	for rows.Next() {
		var cpc models.CategoryProductCount
		if err := rows.Scan(&cpc.CategoryID, &cpc.CategoryName, &cpc.Count); err != nil {
			return nil, err
		}
		results = append(results, cpc)
	}

	return results, rows.Err()
}

func (r *reportRepository) GetAveragePrice() (float64, error) {
	var avg float64
	err := r.db.QueryRow("SELECT AVG(price_cents) / 100.0 FROM bar_system.products WHERE is_active = true").Scan(&avg)
	return avg, err
}

func (r *reportRepository) GetPriceRange() (models.PriceRange, error) {
	var pr models.PriceRange
	query := `
		SELECT 
			MIN(price_cents) / 100.0 as min_price,
			MAX(price_cents) / 100.0 as max_price
		FROM bar_system.products
		WHERE is_active = true
	`
	err := r.db.QueryRow(query).Scan(&pr.Min, &pr.Max)
	return pr, err
}

// Venue reports
func (r *reportRepository) GetTotalLocations() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bar_system.locations").Scan(&count)
	return count, err
}

func (r *reportRepository) GetActiveLocations() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bar_system.locations WHERE is_active = true").Scan(&count)
	return count, err
}

func (r *reportRepository) GetTotalTables() (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM bar_system.tables").Scan(&count)
	return count, err
}

func (r *reportRepository) GetTablesByStatus() ([]models.TableStatusCount, error) {
	query := `
		SELECT status, COUNT(*) as count
		FROM bar_system.tables
		WHERE is_active = true
		GROUP BY status
		ORDER BY count DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.TableStatusCount
	for rows.Next() {
		var tsc models.TableStatusCount
		if err := rows.Scan(&tsc.Status, &tsc.Count); err != nil {
			return nil, err
		}
		results = append(results, tsc)
	}

	return results, rows.Err()
}

func (r *reportRepository) GetLocationDetails() ([]models.LocationDetail, error) {
	query := `
		SELECT 
			l.id::text,
			l.name,
			l.code,
			COUNT(t.id) as total_tables,
			COUNT(CASE WHEN t.status = 'available' THEN 1 END) as available_tables,
			COUNT(CASE WHEN t.status = 'occupied' THEN 1 END) as occupied_tables,
			COUNT(CASE WHEN t.status = 'reserved' THEN 1 END) as reserved_tables
		FROM bar_system.locations l
		LEFT JOIN bar_system.tables t ON l.id = t.location_id AND t.is_active = true
		WHERE l.is_active = true
		GROUP BY l.id, l.name, l.code
		ORDER BY l.name
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.LocationDetail
	for rows.Next() {
		var ld models.LocationDetail
		if err := rows.Scan(
			&ld.LocationID,
			&ld.LocationName,
			&ld.Code,
			&ld.TotalTables,
			&ld.AvailableTables,
			&ld.OccupiedTables,
			&ld.ReservedTables,
		); err != nil {
			return nil, err
		}
		results = append(results, ld)
	}

	return results, rows.Err()
}

func (r *reportRepository) GetVenueDetails(locationID string) (*models.VenueSpecificReport, error) {
	query := `
		SELECT 
			l.id::text,
			l.name,
			l.code,
			COUNT(t.id) as total_tables,
			COUNT(CASE WHEN t.status = 'available' THEN 1 END) as available_tables,
			COUNT(CASE WHEN t.status = 'occupied' THEN 1 END) as occupied_tables,
			COUNT(CASE WHEN t.status = 'reserved' THEN 1 END) as reserved_tables
		FROM bar_system.locations l
		LEFT JOIN bar_system.tables t ON l.id = t.location_id AND t.is_active = true
		WHERE l.id = $1
		GROUP BY l.id, l.name, l.code
	`

	var report models.VenueSpecificReport
	var available, occupied, reserved int
	err := r.db.QueryRow(query, locationID).Scan(
		&report.LocationID,
		&report.LocationName,
		&report.LocationCode,
		&report.TotalTables,
		&available,
		&occupied,
		&reserved,
	)
	if err != nil {
		return nil, err
	}

	report.TablesStatus = models.TableStatusCount{
		Status: "available",
		Count:  available,
	}

	users, err := r.GetVenueUsers(locationID)
	if err != nil {
		return nil, err
	}

	report.AssignedUsers = len(users)
	report.UserDetails = users

	return &report, nil
}

func (r *reportRepository) GetVenueUsers(locationID string) ([]models.VenueUserInfo, error) {
	query := `
		SELECT 
			u.id::text,
			u.email,
			u.first_name,
			u.last_name,
			u.is_active,
			COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') as roles
		FROM bar_system.users u
		LEFT JOIN bar_system.user_roles ur ON u.id = ur.user_id
		LEFT JOIN bar_system.roles r ON ur.role_id = r.id AND r.is_active = true
		WHERE u.venue_id = $1
		GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_active
		ORDER BY u.first_name, u.last_name
	`

	rows, err := r.db.Query(query, locationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.VenueUserInfo
	for rows.Next() {
		var vui models.VenueUserInfo
		var rolesStr string
		if err := rows.Scan(
			&vui.UserID,
			&vui.Email,
			&vui.FirstName,
			&vui.LastName,
			&vui.IsActive,
			&rolesStr,
		); err != nil {
			return nil, err
		}
		// Parse roles from PostgreSQL array format {role1,role2}
		if rolesStr != "{}" {
			// Remove { and }
			rolesStr = rolesStr[1 : len(rolesStr)-1]
			if rolesStr != "" {
				// Split by comma
				roles := strings.Split(rolesStr, ",")
				vui.Roles = make([]string, 0, len(roles))
				for _, role := range roles {
					role = strings.TrimSpace(role)
					if role != "" {
						vui.Roles = append(vui.Roles, role)
					}
				}
			}
		}
		if vui.Roles == nil {
			vui.Roles = []string{}
		}
		results = append(results, vui)
	}

	return results, rows.Err()
}

// Activity reports
func (r *reportRepository) GetTotalLoginAttempts(days int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM bar_system.login_attempts 
		WHERE attempted_at >= NOW() - INTERVAL '%d days'
	`
	err := r.db.QueryRow(fmt.Sprintf(query, days)).Scan(&count)
	return count, err
}

func (r *reportRepository) GetSuccessfulLogins(days int) (int, error) {
	return r.GetRecentLogins(days)
}

func (r *reportRepository) GetLoginAttemptsByDay(days int) ([]models.DailyLoginCount, error) {
	query := `
		SELECT 
			DATE(attempted_at) as date,
			COUNT(*) as count
		FROM bar_system.login_attempts
		WHERE attempted_at >= NOW() - INTERVAL '%d days'
		GROUP BY DATE(attempted_at)
		ORDER BY date DESC
	`

	rows, err := r.db.Query(fmt.Sprintf(query, days))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.DailyLoginCount
	for rows.Next() {
		var dlc models.DailyLoginCount
		var date time.Time
		if err := rows.Scan(&date, &dlc.Count); err != nil {
			return nil, err
		}
		dlc.Date = date.Format("2006-01-02")
		results = append(results, dlc)
	}

	return results, rows.Err()
}

func (r *reportRepository) GetRecentFailedLogins(limit int) ([]models.FailedLoginDetail, error) {
	query := `
		SELECT email, ip_address, attempted_at
		FROM bar_system.login_attempts
		WHERE success = false
		ORDER BY attempted_at DESC
		LIMIT $1
	`

	rows, err := r.db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.FailedLoginDetail
	for rows.Next() {
		var fld models.FailedLoginDetail
		if err := rows.Scan(&fld.Email, &fld.IPAddress, &fld.AttemptedAt); err != nil {
			return nil, err
		}
		results = append(results, fld)
	}

	return results, rows.Err()
}

func (r *reportRepository) GetPasswordResets(days int) (int, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM bar_system.password_reset_log 
		WHERE reset_at >= NOW() - INTERVAL '%d days'
	`
	err := r.db.QueryRow(fmt.Sprintf(query, days)).Scan(&count)
	return count, err
}

func (r *reportRepository) GetPasswordResetsByDay(days int) ([]models.DailyPasswordReset, error) {
	query := `
		SELECT 
			DATE(reset_at) as date,
			COUNT(*) as count
		FROM bar_system.password_reset_log
		WHERE reset_at >= NOW() - INTERVAL '%d days'
		GROUP BY DATE(reset_at)
		ORDER BY date DESC
	`

	rows, err := r.db.Query(fmt.Sprintf(query, days))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.DailyPasswordReset
	for rows.Next() {
		var dpr models.DailyPasswordReset
		var date time.Time
		if err := rows.Scan(&date, &dpr.Count); err != nil {
			return nil, err
		}
		dpr.Date = date.Format("2006-01-02")
		results = append(results, dpr)
	}

	return results, rows.Err()
}


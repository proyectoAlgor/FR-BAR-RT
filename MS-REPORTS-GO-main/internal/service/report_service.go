package service

import (
	"ms-reports-go/internal/models"
	"ms-reports-go/internal/repository"
	"time"
)

type ReportService interface {
	GetUserReport() (*models.UserReport, error)
	GetProductReport() (*models.ProductReport, error)
	GetVenueReport() (*models.VenueReport, error)
	GetActivityReport(days int) (*models.ActivityReport, error)
	GetVenueSpecificReport(locationID string) (*models.VenueSpecificReport, error)
	GetAnalyticsReport() (*models.AnalyticsReport, error)
}

type reportService struct {
	repo repository.ReportRepository
}

func NewReportService(repo repository.ReportRepository) ReportService {
	return &reportService{repo: repo}
}

func (s *reportService) GetUserReport() (*models.UserReport, error) {
	totalUsers, err := s.repo.GetTotalUsers()
	if err != nil {
		return nil, err
	}

	activeUsers, err := s.repo.GetActiveUsers()
	if err != nil {
		return nil, err
	}

	usersByRole, err := s.repo.GetUsersByRole()
	if err != nil {
		return nil, err
	}

	usersByLocation, err := s.repo.GetUsersByLocation()
	if err != nil {
		return nil, err
	}

	recentLogins, err := s.repo.GetRecentLogins(7)
	if err != nil {
		return nil, err
	}

	failedLogins, err := s.repo.GetFailedLogins(7)
	if err != nil {
		return nil, err
	}

	return &models.UserReport{
		TotalUsers:      totalUsers,
		ActiveUsers:     activeUsers,
		InactiveUsers:   totalUsers - activeUsers,
		UsersByRole:     usersByRole,
		UsersByLocation: usersByLocation,
		RecentLogins:    recentLogins,
		FailedLogins:    failedLogins,
	}, nil
}

func (s *reportService) GetProductReport() (*models.ProductReport, error) {
	totalProducts, err := s.repo.GetTotalProducts()
	if err != nil {
		return nil, err
	}

	activeProducts, err := s.repo.GetActiveProducts()
	if err != nil {
		return nil, err
	}

	productsByCategory, err := s.repo.GetProductsByCategory()
	if err != nil {
		return nil, err
	}

	averagePrice, err := s.repo.GetAveragePrice()
	if err != nil {
		return nil, err
	}

	priceRange, err := s.repo.GetPriceRange()
	if err != nil {
		return nil, err
	}

	return &models.ProductReport{
		TotalProducts:      totalProducts,
		ActiveProducts:     activeProducts,
		InactiveProducts:   totalProducts - activeProducts,
		ProductsByCategory: productsByCategory,
		AveragePrice:       averagePrice,
		PriceRange:         priceRange,
	}, nil
}

func (s *reportService) GetVenueReport() (*models.VenueReport, error) {
	totalLocations, err := s.repo.GetTotalLocations()
	if err != nil {
		return nil, err
	}

	activeLocations, err := s.repo.GetActiveLocations()
	if err != nil {
		return nil, err
	}

	totalTables, err := s.repo.GetTotalTables()
	if err != nil {
		return nil, err
	}

	tablesByStatus, err := s.repo.GetTablesByStatus()
	if err != nil {
		return nil, err
	}

	locationDetails, err := s.repo.GetLocationDetails()
	if err != nil {
		return nil, err
	}

	return &models.VenueReport{
		TotalLocations:  totalLocations,
		ActiveLocations: activeLocations,
		TotalTables:     totalTables,
		TablesByStatus:  tablesByStatus,
		LocationDetails: locationDetails,
	}, nil
}

func (s *reportService) GetActivityReport(days int) (*models.ActivityReport, error) {
	if days <= 0 {
		days = 30 // Default to 30 days
	}

	totalLoginAttempts, err := s.repo.GetTotalLoginAttempts(days)
	if err != nil {
		return nil, err
	}

	successfulLogins, err := s.repo.GetSuccessfulLogins(days)
	if err != nil {
		return nil, err
	}

	failedLogins, err := s.repo.GetFailedLogins(days)
	if err != nil {
		return nil, err
	}

	loginAttemptsByDay, err := s.repo.GetLoginAttemptsByDay(days)
	if err != nil {
		return nil, err
	}

	recentFailedLogins, err := s.repo.GetRecentFailedLogins(10)
	if err != nil {
		return nil, err
	}

	passwordResets, err := s.repo.GetPasswordResets(days)
	if err != nil {
		return nil, err
	}

	passwordResetsByDay, err := s.repo.GetPasswordResetsByDay(days)
	if err != nil {
		return nil, err
	}

	return &models.ActivityReport{
		TotalLoginAttempts:  totalLoginAttempts,
		SuccessfulLogins:    successfulLogins,
		FailedLogins:        failedLogins,
		LoginAttemptsByDay:  loginAttemptsByDay,
		RecentFailedLogins:  recentFailedLogins,
		PasswordResets:      passwordResets,
		PasswordResetsByDay: passwordResetsByDay,
	}, nil
}

func (s *reportService) GetVenueSpecificReport(locationID string) (*models.VenueSpecificReport, error) {
	return s.repo.GetVenueDetails(locationID)
}

func (s *reportService) GetAnalyticsReport() (*models.AnalyticsReport, error) {
	userReport, err := s.GetUserReport()
	if err != nil {
		return nil, err
	}

	productReport, err := s.GetProductReport()
	if err != nil {
		return nil, err
	}

	venueReport, err := s.GetVenueReport()
	if err != nil {
		return nil, err
	}

	activityReport, err := s.GetActivityReport(30)
	if err != nil {
		return nil, err
	}

	return &models.AnalyticsReport{
		GeneratedAt:    time.Now(),
		UserReport:     *userReport,
		ProductReport:  *productReport,
		VenueReport:    *venueReport,
		ActivityReport: *activityReport,
	}, nil
}





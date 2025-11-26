import React, { useState } from 'react'
import { Calculator, Search, SortAsc, BarChart3 } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  price: number
  code: string
}

interface ChangeResult {
  success: boolean
  change_amount: number
  total_coins: number
  breakdown: { [key: string]: number }
  message: string
}

interface SortResult {
  success: boolean
  products: Product[]
  message: string
  algorithm_used: string
}

const OptimizationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'change' | 'sort' | 'search' | 'analyze'>('change')
  
  // Change calculation state
  const [amountPaid, setAmountPaid] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [changeResult, setChangeResult] = useState<ChangeResult | null>(null)
  const [changeLoading, setChangeLoading] = useState(false)

  // Sorting state
  const [sortBy, setSortBy] = useState('price_asc')
  const [algorithm, setAlgorithm] = useState('quick')
  const [sortResult, setSortResult] = useState<SortResult | null>(null)
  const [sortLoading, setSortLoading] = useState(false)

  // Sample products for demonstration
  const sampleProducts: Product[] = [
    { id: '1', name: 'Corona Extra', category: 'Cervezas', price: 3.50, code: 'BEER001' },
    { id: '2', name: 'Margarita', category: 'Cócteles', price: 8.00, code: 'COCK001' },
    { id: '3', name: 'Nachos Supreme', category: 'Comida', price: 6.50, code: 'FOOD001' },
    { id: '4', name: 'Coca Cola', category: 'Refrescos', price: 2.00, code: 'SODA001' },
    { id: '5', name: 'Whiskey Premium', category: 'Licores', price: 12.00, code: 'LIQ001' },
  ]

  const handleCalculateChange = async () => {
    if (!amountPaid || !totalCost) return
    
    setChangeLoading(true)
    try {
      const response = await fetch('http://localhost:8084/api/optimization/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_paid: parseFloat(amountPaid),
          total_cost: parseFloat(totalCost),
        }),
      })
      
      const result = await response.json()
      setChangeResult(result)
    } catch (error) {
      console.error('Error calculating change:', error)
    } finally {
      setChangeLoading(false)
    }
  }

  const handleSortProducts = async () => {
    setSortLoading(true)
    try {
      const response = await fetch('http://localhost:8084/api/optimization/sort/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: sampleProducts,
          sort_by: sortBy,
          algorithm: algorithm,
        }),
      })
      
      const result = await response.json()
      setSortResult(result)
    } catch (error) {
      console.error('Error sorting products:', error)
    } finally {
      setSortLoading(false)
    }
  }

  const renderChangeCalculator = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Cost ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <button
        onClick={handleCalculateChange}
        disabled={changeLoading || !amountPaid || !totalCost}
        className="w-full bg-gradient-to-r from-golden-500 to-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-golden-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {changeLoading ? 'Calculating...' : 'Calculate Optimal Change'}
      </button>

      {changeResult && (
        <div className={`p-6 rounded-lg ${changeResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${changeResult.success ? 'text-green-800' : 'text-red-800'}`}>
            Change Calculation Result
          </h3>
          
          {changeResult.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Change Amount:</span>
                  <p className="text-xl font-bold text-green-700">${changeResult.change_amount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Coins:</span>
                  <p className="text-xl font-bold text-green-700">{changeResult.total_coins}</p>
                </div>
              </div>
              
              {Object.keys(changeResult.breakdown).length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">Breakdown:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(changeResult.breakdown).map(([coin, quantity]) => (
                      <div key={coin} className="flex justify-between bg-white p-2 rounded border">
                        <span className="font-medium">{coin}</span>
                        <span className="text-golden-600">×{quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-sm text-green-700">{changeResult.message}</p>
            </div>
          ) : (
            <p className="text-red-700">{changeResult.message}</p>
          )}
        </div>
      )}
    </div>
  )

  const renderSortingDemo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
          >
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="name_asc">Name (A to Z)</option>
            <option value="name_desc">Name (Z to A)</option>
            <option value="code_asc">Code (A to Z)</option>
            <option value="category_asc">Category (A to Z)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
          >
            <option value="quick">Quick Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="selection">Selection Sort</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSortProducts}
        disabled={sortLoading}
        className="w-full bg-gradient-to-r from-golden-500 to-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-golden-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {sortLoading ? 'Sorting...' : 'Sort Products'}
      </button>

      {sortResult && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Sorting Result ({sortResult.algorithm_used})
          </h3>
          
          <div className="space-y-2">
            {sortResult.products.map((product) => (
              <div key={product.id} className="flex justify-between items-center bg-white p-3 rounded border">
                <div>
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({product.code})</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-golden-600">${product.price.toFixed(2)}</span>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-blue-700 mt-4">{sortResult.message}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 font-golden">Algorithm Optimization Demo</h1>
        <p className="text-gray-600 mt-2">
          Demonstration of algorithms from the algorithmDesign folder integrated into bar management
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('change')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'change'
              ? 'bg-white text-golden-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Change Calculator
        </button>
        <button
          onClick={() => setActiveTab('sort')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'sort'
              ? 'bg-white text-golden-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <SortAsc className="w-4 h-4 mr-2" />
          Product Sorting
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'search'
              ? 'bg-white text-golden-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search className="w-4 h-4 mr-2" />
          Product Search
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'analyze'
              ? 'bg-white text-golden-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Order Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'change' && renderChangeCalculator()}
        {activeTab === 'sort' && renderSortingDemo()}
        {activeTab === 'search' && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Product Search Demo</h3>
            <p className="text-gray-500">Binary search and linear search algorithms coming soon...</p>
          </div>
        )}
        {activeTab === 'analyze' && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Order Analysis Demo</h3>
            <p className="text-gray-500">Recursive and iterative analysis algorithms coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OptimizationDemo

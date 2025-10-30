import { Hono } from 'hono'
import { cors } from 'hono/cors'

import authRoutes from './services/AuthService/authRoute'
import {rolePermissionRoutes} from './services/RolePermissionService/rolePermissionRoutes'
import companyBranchRoutes from './services/CompanyBranchService/companyBranchRoutes'
import categoryProductRoutes from './services/CategoryProductService/categoryProductRoutes'
import orderRoutes from './services/OrderTableService/orderRoutes'
import orderItemRoutes from './services/OrderTableService/orderItemRoutes'
import orderItemIngredientRoutes from './services/OrderTableService/orderItemIngredientRoutes'

import connectDB from './db/connect'

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

// Veritabanı bağlantısı
connectDB()

// Rotalar
app.route('/auth', authRoutes)
app.route('/role-permission', rolePermissionRoutes)
app.route('/companies-branches', companyBranchRoutes)
app.route('/category-product', categoryProductRoutes)
app.route('/orders', orderRoutes)
app.route('/order-items', orderItemRoutes)
app.route('/order-item-ingredients', orderItemIngredientRoutes)

export default {
  port: 3000,
  fetch: app.fetch,
}

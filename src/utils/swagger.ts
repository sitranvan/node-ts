import fs from 'fs'
import path from 'path'
import swaggerJsdoc from 'swagger-jsdoc'
import YAML from 'yaml'

// Swagger, chạy tại đường dẫn http://localhost:3000/api-docs
const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')
const swaggerDocument = YAML.parse(file)

// Viết trực tiếp không cần sử dụng file yaml
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter API',
      version: '1.0.0'
    }
    // Header authorization
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT'
    //     }
    //   }
    // }
  },

  //   apis: [path.resolve('src/routes/*.routes.ts'), path.resolve('src/models/requests/*.requests.ts')]
  // Có thể tách nhỏ file yaml
  apis: [path.resolve('swaggers/*.yaml')]
}

export const openapiSpecification = swaggerJsdoc(options)

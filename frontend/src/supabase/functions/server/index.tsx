import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger())

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// RF1 - Criar veículos
app.post('/make-server-1156d058/vehicles', async (c) => {
  try {
    console.log('Creating vehicle...')
    const requestBody = await c.req.json()
    console.log('Request body:', requestBody)
    
    const { plate, deviceModel, deviceId } = requestBody
    
    if (!plate || !deviceModel || !deviceId) {
      console.log('Missing required fields:', { plate, deviceModel, deviceId })
      return c.json({ error: 'Plate, deviceModel and deviceId are required' }, 400)
    }

    const vehicleId = `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const vehicle = {
      id: vehicleId,
      plate: String(plate).trim(),
      deviceModel: String(deviceModel).trim(),
      deviceId: Number(deviceId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('Saving vehicle:', vehicle)
    await kv.set(vehicleId, vehicle)
    console.log(`Vehicle created successfully: ${vehicleId}`)
    
    return c.json({ success: true, vehicle })
  } catch (error) {
    console.error(`Error creating vehicle: ${error}`)
    return c.json({ error: 'Failed to create vehicle', details: error.message }, 500)
  }
})

// RF2 - Buscar veículos cadastrados
app.get('/make-server-1156d058/vehicles', async (c) => {
  try {
    console.log('Fetching vehicles...')
    const vehicles = await kv.getByPrefix('vehicle_')
    console.log(`Retrieved ${vehicles.length} vehicles:`, vehicles)
    return c.json({ vehicles, success: true })
  } catch (error) {
    console.error(`Error fetching vehicles: ${error}`)
    return c.json({ error: 'Failed to fetch vehicles', details: error.message }, 500)
  }
})

// RF2 - Buscar veículo específico
app.get('/make-server-1156d058/vehicles/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const vehicle = await kv.get(id)
    
    if (!vehicle) {
      return c.json({ error: 'Vehicle not found' }, 404)
    }
    
    console.log(`Retrieved vehicle: ${id}`)
    return c.json({ vehicle })
  } catch (error) {
    console.log(`Error fetching vehicle: ${error}`)
    return c.json({ error: 'Failed to fetch vehicle' }, 500)
  }
})

// RF3 - Editar veículos cadastrados
app.put('/make-server-1156d058/vehicles/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    
    const existingVehicle = await kv.get(id)
    if (!existingVehicle) {
      return c.json({ error: 'Vehicle not found' }, 404)
    }
    
    const updatedVehicle = {
      ...existingVehicle,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(id, updatedVehicle)
    console.log(`Vehicle updated successfully: ${id}`)
    
    return c.json({ success: true, vehicle: updatedVehicle })
  } catch (error) {
    console.log(`Error updating vehicle: ${error}`)
    return c.json({ error: 'Failed to update vehicle' }, 500)
  }
})

// RF4 - Deletar veículos cadastrados
app.delete('/make-server-1156d058/vehicles/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const existingVehicle = await kv.get(id)
    if (!existingVehicle) {
      return c.json({ error: 'Vehicle not found' }, 404)
    }
    
    await kv.del(id)
    
    // Deletar dados de tracking relacionados
    const trackingData = await kv.getByPrefix(`tracking_${id}_`)
    for (const tracking of trackingData) {
      await kv.del(`tracking_${id}_${tracking.positionId}`)
    }
    
    console.log(`Vehicle deleted successfully: ${id}`)
    return c.json({ success: true, message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.log(`Error deleting vehicle: ${error}`)
    return c.json({ error: 'Failed to delete vehicle' }, 500)
  }
})

// RF5 e RF6 - Upload e processamento de JSON de dados de rastreamento
app.post('/make-server-1156d058/vehicles/:id/tracking', async (c) => {
  try {
    const vehicleId = c.req.param('id')
    const trackingData = await c.req.json()
    
    const vehicle = await kv.get(vehicleId)
    if (!vehicle) {
      return c.json({ error: 'Vehicle not found' }, 404)
    }
    
    if (!Array.isArray(trackingData)) {
      return c.json({ error: 'Tracking data must be an array' }, 400)
    }
    
    let processedCount = 0
    
    for (const point of trackingData) {
      // Validar dados essenciais
      if (!point.plate || !point.latitude || !point.longitude || !point.date) {
        console.log(`Skipping invalid tracking point: ${JSON.stringify(point)}`)
        continue
      }
      
      // Verificar se o ponto pertence ao veículo
      if (point.plate !== vehicle.plate) {
        console.log(`Skipping tracking point for different vehicle: ${point.plate}`)
        continue
      }
      
      const trackingId = `tracking_${vehicleId}_${point.positionId || Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      
      const processedPoint = {
        id: trackingId,
        vehicleId,
        plate: point.plate,
        deviceModel: point.deviceModel,
        deviceId: point.deviceId,
        positionId: point.positionId,
        date: point.date,
        dateUTC: point.dateUTC,
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        speed: Number(point.speed) || 0,
        direction: Number(point.direction) || 0,
        ignition: point.ignition,
        odometer: Number(point.odometer) || 0,
        address: point.address || '',
        mainBattery: point.mainBattery,
        backupBattery: point.backupBattery,
        createdAt: new Date().toISOString()
      }
      
      await kv.set(trackingId, processedPoint)
      processedCount++
    }
    
    console.log(`Processed ${processedCount} tracking points for vehicle ${vehicleId}`)
    return c.json({ 
      success: true, 
      message: `Processed ${processedCount} tracking points`,
      processedCount 
    })
    
  } catch (error) {
    console.log(`Error processing tracking data: ${error}`)
    return c.json({ error: 'Failed to process tracking data' }, 500)
  }
})

// RF7 - Obter dados de rastreamento para apresentar rota
app.get('/make-server-1156d058/vehicles/:id/tracking', async (c) => {
  try {
    const vehicleId = c.req.param('id')
    
    const vehicle = await kv.get(vehicleId)
    if (!vehicle) {
      return c.json({ error: 'Vehicle not found' }, 404)
    }
    
    const trackingData = await kv.getByPrefix(`tracking_${vehicleId}_`)
    
    // Ordenar por data
    const sortedTracking = trackingData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    console.log(`Retrieved ${sortedTracking.length} tracking points for vehicle ${vehicleId}`)
    return c.json({ trackingData: sortedTracking })
    
  } catch (error) {
    console.log(`Error fetching tracking data: ${error}`)
    return c.json({ error: 'Failed to fetch tracking data' }, 500)
  }
})

// Health check
app.get('/make-server-1156d058/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

console.log('Herrlog Vehicle Tracking Server started successfully')
Deno.serve(app.fetch)
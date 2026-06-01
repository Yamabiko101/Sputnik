import { getCurrentPet } from '../database/repositories/pets.repository.js'

export function getCurrentPetService() {
  return getCurrentPet()
}

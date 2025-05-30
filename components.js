// E-Powertrain Components Database
const COMPONENTS = {
    batteries: [
        {
            id: 'battery_1',
            name: 'LFP Standard Pack',
            capacity: 400, // kWh
            voltage: 800, // V
            weight: 2800, // kg
            chargingSpeed: 150, // kW max
            efficiency: 0.95,
            cost: 100000,
            specs: '400kWh, 800V, 2800kg'
        },
        {
            id: 'battery_2',
            name: 'NCM High Density',
            capacity: 550, // kWh
            voltage: 800, // V
            weight: 3200, // kg
            chargingSpeed: 350, // kW max
            efficiency: 0.93,
            cost: 165000,
            specs: '550kWh, 800V, 3200kg'
        },
        {
            id: 'battery_3',
            name: 'LTO Fast Charge',
            capacity: 300, // kWh
            voltage: 600, // V
            weight: 2200, // kg
            chargingSpeed: 500, // kW max
            efficiency: 0.90,
            cost: 120000,
            specs: '300kWh, 600V, 2200kg'
        }
    ],
    
    inverters: [
        {
            id: 'inverter_1',
            name: 'SiC Standard 400kW',
            maxPower: 400, // kW
            efficiency: 0.96,
            weight: 180, // kg
            voltage: 800, // V compatible
            thermalLimit: 85, // °C
            cost: 25000,
            specs: '400kW, 96% eff, 180kg'
        },
        {
            id: 'inverter_2',
            name: 'SiC High Power 600kW',
            maxPower: 600, // kW
            efficiency: 0.95,
            weight: 250, // kg
            voltage: 800, // V compatible
            thermalLimit: 90, // °C
            cost: 40000,
            specs: '600kW, 95% eff, 250kg'
        },
        {
            id: 'inverter_3',
            name: 'GaN Ultra Efficient',
            maxPower: 350, // kW
            efficiency: 0.98,
            weight: 120, // kg
            voltage: 600, // V compatible
            thermalLimit: 80, // °C
            cost: 35000,
            specs: '350kW, 98% eff, 120kg'
        }
    ],
    
    'e-axles': [
        {
            id: 'eaxle_1',
            name: 'Single Motor Axle',
            maxTorque: 15000, // Nm
            maxPower: 300, // kW
            maxSpeed: 2500, // rpm
            efficiency: 0.94,
            weight: 450, // kg
            gearRatio: 10.5,
            cost: 45000,
            specs: '300kW, 15kNm, 450kg'
        },
        {
            id: 'eaxle_2',
            name: 'Dual Motor Performance',
            maxTorque: 25000, // Nm
            maxPower: 500, // kW
            maxSpeed: 3000, // rpm
            efficiency: 0.92,
            weight: 680, // kg
            gearRatio: 8.5,
            cost: 75000,
            specs: '500kW, 25kNm, 680kg'
        },
        {
            id: 'eaxle_3',
            name: 'High Efficiency Urban',
            maxTorque: 12000, // Nm
            maxPower: 250, // kW
            maxSpeed: 2000, // rpm
            efficiency: 0.96,
            weight: 380, // kg
            gearRatio: 12.0,
            cost: 38000,
            specs: '250kW, 12kNm, 380kg'
        }
    ],
    
    'thermal-systems': [
        {
            id: 'thermal_1',
            name: 'Air Cooling Basic',
            coolingCapacity: 50, // kW
            powerConsumption: 8, // kW
            weight: 120, // kg
            minTemp: -20, // °C
            maxTemp: 45, // °C
            cost: 15000,
            specs: '50kW cooling, 8kW power'
        },
        {
            id: 'thermal_2',
            name: 'Liquid Cooling Advanced',
            coolingCapacity: 120, // kW
            powerConsumption: 15, // kW
            weight: 200, // kg
            minTemp: -30, // °C
            maxTemp: 50, // °C
            cost: 35000,
            specs: '120kW cooling, 15kW power'
        },
        {
            id: 'thermal_3',
            name: 'Heat Pump System',
            coolingCapacity: 80, // kW
            powerConsumption: 6, // kW (efficient)
            weight: 160, // kg
            minTemp: -25, // °C
            maxTemp: 40, // °C
            cost: 28000,
            specs: '80kW cooling, 6kW power'
        }
    ]
};

// Component compatibility rules
const COMPATIBILITY_RULES = {
    voltage: {
        // Battery voltage must match or be compatible with inverter
        check: (battery, inverter) => {
            if (!battery || !inverter) return true;
            return Math.abs(battery.voltage - inverter.voltage) <= 200; // 200V tolerance
        },
        message: "Battery and inverter voltage levels are not compatible"
    },
    
    power: {
        // Inverter max power should handle e-axle requirements
        check: (inverter, eaxle) => {
            if (!inverter || !eaxle) return true;
            return inverter.maxPower >= eaxle.maxPower * 0.9; // 10% margin
        },
        message: "Inverter power rating is insufficient for selected e-axle"
    },
    
    thermal: {
        // Thermal system should handle inverter heat generation
        check: (thermal, inverter, eaxle) => {
            if (!thermal || !inverter) return true;
            const heatGeneration = (inverter.maxPower * (1 - inverter.efficiency)) + 
                                 (thermal.powerConsumption);
            return thermal.coolingCapacity >= heatGeneration * 1.2; // 20% margin
        },
        message: "Thermal system capacity is insufficient for power electronics cooling"
    },
    
    weight: {
        // Total weight limit for truck chassis
        check: (battery, inverter, eaxle, thermal) => {
            const totalWeight = (battery?.weight || 0) + 
                              (inverter?.weight || 0) + 
                              (eaxle?.weight || 0) + 
                              (thermal?.weight || 0);
            return totalWeight <= 8000; // 8 ton limit
        },
        message: "Total component weight exceeds chassis capacity (8000kg)"
    }
};

// Performance calculation formulas
const PERFORMANCE_CALCULATOR = {
    // Calculate estimated range based on components
    calculateRange: (battery, inverter, eaxle, thermal) => {
        if (!battery || !inverter || !eaxle) return 0;
        
        const usableCapacity = battery.capacity * 0.9; // 90% usable
        const systemEfficiency = battery.efficiency * inverter.efficiency * eaxle.efficiency;
        const auxiliaryPower = (thermal?.powerConsumption || 0) + 10; // 10kW for other systems
        
        // Assuming average consumption of 1.8 kWh/km for heavy truck
        const baseConsumption = 1.8;
        const efficiencyFactor = systemEfficiency / 0.9; // Normalized to 90% baseline
        const actualConsumption = baseConsumption / efficiencyFactor;
        
        // Range calculation including auxiliary power impact
        const range = (usableCapacity / (actualConsumption + auxiliaryPower * 0.001)) * 0.85; // 15% safety margin
        
        return Math.round(range);
    },
    
    // Calculate total system power
    calculateTotalPower: (inverter, eaxle) => {
        if (!inverter || !eaxle) return 0;
        return Math.min(inverter.maxPower, eaxle.maxPower);
    },
    
    // Calculate total weight
    calculateTotalWeight: (battery, inverter, eaxle, thermal) => {
        return (battery?.weight || 0) + 
               (inverter?.weight || 0) + 
               (eaxle?.weight || 0) + 
               (thermal?.weight || 0);
    },
    
    // Calculate system efficiency
    calculateSystemEfficiency: (battery, inverter, eaxle) => {
        if (!battery || !inverter || !eaxle) return 0;
        return battery.efficiency * inverter.efficiency * eaxle.efficiency;
    }
};

// Educational tips based on component selection
const EDUCATIONAL_TIPS = {
    battery: {
        lfp: "LFP batteries offer excellent cycle life and safety but have lower energy density",
        ncm: "NCM batteries provide high energy density but require careful thermal management",
        lto: "LTO batteries enable ultra-fast charging but have lower energy density"
    },
    
    inverter: {
        sic: "Silicon Carbide inverters offer high efficiency and power density",
        gan: "Gallium Nitride technology provides the highest efficiency but at premium cost",
        thermal: "Higher power inverters generate more heat and require better cooling"
    },
    
    eaxle: {
        torque: "Higher torque enables better acceleration and hill climbing capability",
        efficiency: "Higher efficiency e-axles extend vehicle range significantly",
        gearing: "Lower gear ratios provide more torque but limit top speed"
    },
    
    thermal: {
        air: "Air cooling is simple and cost-effective but limited in extreme conditions",
        liquid: "Liquid cooling provides better performance but adds complexity",
        heatpump: "Heat pump systems are most efficient but require advanced controls"
    }
};

// Driving scenarios with different conditions
const DRIVING_SCENARIOS = [
    {
        name: "Urban Delivery",
        description: "Stop-and-go city driving with multiple delivery stops",
        terrainFactor: 1.0,
        trafficFactor: 1.3, // More energy due to stops
        weather: "normal",
        distance: 150, // km
        avgSpeed: 35, // km/h
        regenerationOpportunity: 0.3 // 30% energy recovery
    },
    {
        name: "Highway Cruising",
        description: "Long-distance highway driving at constant speed",
        terrainFactor: 1.0,
        trafficFactor: 0.8, // Less energy due to constant speed
        weather: "normal",
        distance: 400, // km
        avgSpeed: 80, // km/h
        regenerationOpportunity: 0.1 // 10% energy recovery
    },
    {
        name: "Mountain Route",
        description: "Challenging terrain with hills and curves",
        terrainFactor: 1.4, // More energy for climbing
        trafficFactor: 1.0,
        weather: "normal",
        distance: 200, // km
        avgSpeed: 50, // km/h
        regenerationOpportunity: 0.5 // 50% energy recovery on downhills
    }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COMPONENTS,
        COMPATIBILITY_RULES,
        PERFORMANCE_CALCULATOR,
        EDUCATIONAL_TIPS,
        DRIVING_SCENARIOS
    };
}
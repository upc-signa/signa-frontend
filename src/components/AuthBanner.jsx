export default function AuthBanner() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 p-8 lg:p-16 flex items-center justify-center relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-10 left-10 w-16 h-16 bg-purple-200 rounded-full opacity-30"></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-blue-200 rounded-full opacity-30"></div>
          <div className="absolute top-1/3 right-20 w-8 h-8 bg-purple-300 rounded-full opacity-40"></div>
          
          {/* Ilustración simplificada */}
          <div className="relative z-10 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 inline-block">
              <div className="flex gap-6">
                {/* Persona 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-400 rounded-full mb-2"></div>
                  <div className="w-12 h-12 bg-blue-500 rounded-t-full"></div>
                </div>
                {/* Persona 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-orange-400 rounded-full mb-2"></div>
                  <div className="w-12 h-12 bg-orange-500 rounded-t-full"></div>
                </div>
              </div>
            </div>
            
            {/* Persona principal */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-purple-600 rounded-full mb-4"></div>
                <div className="w-24 h-32 bg-gradient-to-b from-white to-blue-500 rounded-t-full mx-auto"></div>
                <div className="absolute -right-12 top-8 bg-orange-300 rounded-full p-3">
                  <div className="w-8 h-8 bg-orange-400 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
}
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile, FilterOptions } from '../types/types';
import ActionButtons from '../components/ActionButton';
import FilterDialog from '../components/FilterDialog';
import ProfileCard from '../components/ProfileCard';
import ProfilePage from './Profilepage';
import { Alert, AlertDescription } from '../components/ui/alert';

const DiscoverPage = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
	const [currentPhoto, setCurrentPhoto] = useState(0);
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [filters, setFilters] = useState<FilterOptions>({
		minAge: 18,
		maxAge: 100,
		minFame: 0,
		maxFame: 100,
		sortBy: 'distance',
		maxDistance: 100,
		minCommonTags: 0,
		filterTags: []
	});

	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');


	useEffect(() => {
		fetchProfiles();
	}, [page, filters]);

	async function fetchProfiles() {
		try {
			setLoading(true);
			const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/potential-matches`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: 'include',
				body: JSON.stringify({
					...filters,
					page,
					limit: 10
				})
			});

			const res = await response.json();
			if (res.success) {
				setProfiles(prev => page === 1 ? res.data : [...prev, ...res.data]);
				setHasMore(res.pagination.hasMore);
				setError(null);
			} else {
				setError(res.error || 'Failed to fetch profiles');
			}
		} catch (error) {
			console.error("Error fetching profiles:", error);
			setError('Failed to fetch profiles');
		} finally {
			setLoading(false);
		}
	}


async function likeUser() {
    if (!profiles[currentIndex]) return;

    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/like-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({
                likedUsername: profiles[currentIndex].username
            })
        });

        const res = await response.json();

        if (res.success) {
            handleSwipe('right');
        } else if (res.setupRequired) {
            // Handle the case where setup isn't done (not an error)
            setAlertMessage("Please complete your profile setup to like other users");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        } else {
            // Handle actual errors
            setAlertMessage(res.error || "Failed to like user");
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        }
    } catch (error) {
        setAlertMessage("Failed to like user. Please try again.");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    }
}

	const handleProfileClick = () => {
		// console.log(username)
		setIsProfileOpen(true);
	};

	const handleSwipe = (direction: 'left' | 'right') => {
		if (currentIndex < profiles.length - 1) {
			setExitDirection(direction);
			setTimeout(() => {
				setCurrentIndex(prev => prev + 1);
				setCurrentPhoto(0);
				setExitDirection(null);
			}, 300);

			// Fetch more profiles when nearing the end
			if (currentIndex >= profiles.length - 3 && hasMore) {
				setPage(prev => prev + 1);
			}
		} else if (hasMore) {
			// If we're at the end of the current profiles but there are more to fetch
			setPage(prev => prev + 1);
		}
	};

	if (loading && profiles.length === 0) {
		return (
			<div className="h-screen bg-[#1a1625] flex items-center justify-center">
				<div className="text-white">Loading profiles...</div>
			</div>
		);
	}

	if (error && profiles.length === 0) {
		return (
			<div className="h-screen bg-[#1a1625] flex items-center justify-center">
				<div className="text-red-500">{error}</div>
			</div>
		);
	}

	if (!loading && profiles.length === 0) {
		return (
			<div className="h-screen bg-[#1a1625] flex items-center justify-center flex-col gap-4">
				<div className="text-white text-xl">No profiles found</div>
				<p className="text-gray-400 text-center max-w-md">
					Try adjusting your filters to see more people
				</p>
				<button
					onClick={() => {
						setFilters({
							minAge: 18,
							maxAge: 100,
							minFame: 0,
							maxFame: 100,
							sortBy: 'distance',
							maxDistance: 100,
							minCommonTags: 0,
							filterTags: []
						});
						setPage(1);
					}}
					className="px-6 py-2 bg-[#e94057] text-white rounded-full hover:bg-[#e94057]/90 transition-colors"
				>
					Reset Filters
				</button>
			</div>
		);
	}


	return (
		<div>
			<AnimatePresence>
				{showAlert && (
					<motion.div
						initial={{ opacity: 0, y: -50 }}
						animate={{ opacity: 1, y: 100, x: -10 }}
						exit={{ opacity: 0, y: -50 }}
						className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
					>
						<Alert className="bg-[#2a2435] border-[#e94057] text-white">
							<AlertDescription>{alertMessage}</AlertDescription>
						</Alert>
					</motion.div>
				)}
			</AnimatePresence>


			{isProfileOpen ? <ProfilePage username={profiles[currentIndex].username} isOpen={isProfileOpen}
				setIsOpen={setIsProfileOpen}
			/> :

				<div className="h-[calc(100vh-4rem)] bg-[#1a1625]">
					<div className="h-full max-w-[2000px] mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center gap-6">
						<div className="flex-1 relative h-[70vh] lg:h-full">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="relative w-full max-w-xl aspect-[3/4] overflow-hidden">
									<AnimatePresence>
										{profiles.map((profile, index) => (
											index >= currentIndex && (
												<motion.div
													key={profile.id}
													initial={{ scale: index === currentIndex ? 1 : 0.95 }}
													animate={index === currentIndex ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.5 }}
													exit={exitDirection === 'left'
														? { x: '-100%', opacity: 0, rotate: -20 }
														: { x: '100%', opacity: 0, rotate: 20 }
													}
													transition={{ duration: 0.3 }}
													className="absolute inset-0 cursor-pointer"
													style={{ zIndex: profiles.length - index }}
													onClick={() => handleProfileClick()}
												>
													<ProfileCard
														profile={profile}
														currentPhoto={currentPhoto}
													/>
												</motion.div>
											)
										))}
									</AnimatePresence>
								</div>
							</div>
						</div>

						<div className="hidden lg:block w-96 h-[40vh] xl:w-[30rem]">
							{currentIndex < profiles.length && (
								<div className="h-full flex flex-col">
									<div className="bg-[#2a2435] rounded-3xl p-8 mb-6 border border-[#3a3445]">
										<div className="flex items-center justify-between mb-6">
											<div>
												<h2 className="text-3xl font-bold text-white">
													{profiles[currentIndex].name}
												</h2>
												<div className="flex items-center mt-2 text-gray-400">
													<MapPin className="w-4 h-4 mr-1" />
													<span>{profiles[currentIndex].distance} km</span>
												</div>
											</div>
											<div className="text-5xl font-bold text-[#e94057]">
												{profiles[currentIndex].age}
											</div>
										</div>

										<div className="py-4 border-y border-[#3a3445]">
											<p className="text-gray-300 text-lg leading-relaxed break-words overflow-wrap">
												{profiles[currentIndex].preview.bio}
											</p>
											<button
												onClick={() => handleProfileClick()}
												className="mt-2 text-[#e94057] font-medium hover:underline"
											>
												View Full Profile
											</button>
										</div>
										<div className="mt-6">
											<div className="flex items-center justify-between mb-3">
												<h3 className="text-lg font-semibold text-white">Interests</h3>
												<button
													onClick={() => handleProfileClick()}
													className="text-[#e94057] text-sm font-medium hover:underline"
												>
													View all
												</button>
											</div>
											<div className="flex flex-wrap gap-2">
												{profiles[currentIndex].preview.interests.slice(0, 2).map((interest: string) => (
													<span
														key={interest + profiles[currentIndex].id}
														className="px-4 py-2 bg-[#3a3445] rounded-full text-sm 
												font-medium text-white hover:bg-[#e94057] transition-colors
												border border-[#e94057]/10 hover:border-transparent cursor-pointer"

													>
														{interest}
													</span>
												))}
											</div>
										</div>
									</div>
									<div className="bg-[#2a2435] rounded-3xl p-8 border border-[#3a3445]">
										<ActionButtons onSwipe={handleSwipe} onLike={likeUser} />
									</div>
								</div>
							)}
						</div>

						<div className="lg:hidden">
							<ActionButtons onSwipe={handleSwipe} onLike={likeUser} />
						</div>

						<FilterDialog
							filters={filters}
							onFilterChange={(newFilters) => {
								setFilters(newFilters);
								setCurrentIndex(0);
								setPage(1);
							}}
						/>
					</div>
				</div>}
		</div>
	);
};

export default DiscoverPage;
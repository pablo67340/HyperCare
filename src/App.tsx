import React, { useEffect, useState } from 'react';
import 'bulma/css/bulma.css';

interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  avatar: string;
  role: string;
  join_date: string;
  description: string;
}

interface ApiResponse {
  data: {
    users: User[];
  };
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalActive, setIsModalActive] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const usersPerPage = 8;
  const totalPages = Math.ceil(users.length / usersPerPage);

  useEffect(() => {
    fetch('https://9e06da9a-97cf-4701-adfc-9b9a5713bbb9.mock.pstmn.io/users')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      })
      .then((data: ApiResponse) => {
        setUsers(data.data.users);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users.");
        setLoading(false);
      });
  }, []);

  const handleViewMore = (user: User) => {
    setSelectedUser(user);
    setIsModalActive(true);
  };

  const handleCloseModal = () => {
    setIsModalActive(false);
    setSelectedUser(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + usersPerPage);

  if (loading) {
    return (
      <div className="container main-container is-centered is-vcentered">
        <div className="column is-full">
          <div className="card">
            <div className="card-content">
              <p className="title">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const renderPagination = () => {
    const pageNumbers = [];
    const pageRange = 2; // Number of pages to show beside the current page button

    // Always show the first page regardless of the current page
    pageNumbers.push(1);

    // Show ellipsis if there are pages between 1 and the start of the range
    if (currentPage > pageRange + 2) {
      pageNumbers.push('ellipsis-left');
    }

    // Add pages around the current page
    for (let i = Math.max(2, currentPage - pageRange); i <= Math.min(totalPages - 1, currentPage + pageRange); i++) {
      pageNumbers.push(i);
    }

    // Show ellipsis if there are pages between the end of the range and the last page
    if (currentPage < totalPages - pageRange - 1) {
      pageNumbers.push('ellipsis-right');
    }

    // Always show the last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return (
      <ul className="pagination-list">
        {pageNumbers.map((page, index) =>
          typeof page === 'number' ? (
            <li key={index}>
              <button
                className={`pagination-link ${currentPage === page ? 'is-current' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            </li>
          ) : (
            <li key={index}>
              <span className="pagination-ellipsis">&hellip;</span>
            </li>
          )
        )}
      </ul>
    );
  };


  return (
    <React.Fragment>
      {/* User List */}
      <div className="container main-container">
        <div className="columns is-multiline">
          {paginatedUsers.map(user => (
            <div key={user.id} className="column is-one-quarter-fullhd is-one-third-desktop is-half-tablet">
              <div className="card card-user">
                <div className="card-image">
                  <figure className="image is-128x128 is-inline-block image-figure">
                    <img
                      src={user.avatar}
                      alt={`${user.firstname} ${user.lastname}`}
                      className="image-item"
                      onError={() => {
                        setUsers(users.map(u => u.id === user.id ? { ...u, avatar: 'https://via.placeholder.com/128x128?text=No%20Image' } : u));
                      }}
                    />
                  </figure>
                </div>
                <div className="card-content">
                  <div className="media">
                    <div className="media-content has-text-centered">
                      <p className="title is-4">{user.firstname} {user.lastname}</p>
                      <p className="subtitle is-6">{user.role}</p>
                    </div>
                  </div>
                  <div className="content has-text-centered">
                    <button
                      className="button is-link"
                      onClick={() => handleViewMore(user)}
                    >
                      View More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <nav className="pagination is-centered" role="navigation" aria-label="pagination">
          <button
            className="pagination-previous"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="pagination-next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          {renderPagination()}
        </nav>

        {/* Modal Implementation */}
        {selectedUser && (
          <div className={`modal ${isModalActive ? 'is-active' : ''}`} role="dialog">
            <div className="modal-background" onClick={handleCloseModal}></div>
            <div className="modal-content">
              <div className="box box-user">
                <figure className="image is-128x128 image-figure">
                  <img
                    src={selectedUser.avatar}
                    alt={`${selectedUser.firstname} ${selectedUser.lastname}`}
                    className="image-item"
                  />
                </figure>
                <h2 className="title is-4 title-user">{selectedUser.firstname} {selectedUser.lastname}</h2>
                <p className="subtitle is-6">{selectedUser.role}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Join Date:</strong> {selectedUser.join_date}</p>
                <p>&nbsp;</p>
                <p><strong>Description:</strong></p>
                <p>{selectedUser.description}</p>
              </div>
            </div>
            <button className="modal-close is-large" aria-label="close" onClick={handleCloseModal}></button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

export default App;
